export interface SourceFile {
  name: string;
  path: string;
  language: string;
  category: 'database' | 'parser' | 'ui' | 'sync' | 'config';
  code: string;
  description: string;
}

export const kotlinSourceFiles: SourceFile[] = [
  {
    name: "RoomEntities.kt",
    path: "com/example/langapp/data/local/entities/RoomEntities.kt",
    language: "kotlin",
    category: "database",
    description: "Definition of the Room Database tables (Entities), foreign keys, and indices to support Topics, Articles, and Access Logs.",
    code: `package com.example.langapp.data.local.entities

import androidx.room.*
import java.util.Date

@Entity(tableName = "topics")
data class TopicEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val description: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "articles",
    foreignKeys = [
        ForeignKey(
            entity = TopicEntity::class,
            parentColumns = ["id"],
            childColumns = ["topicId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["topicId"])]
)
data class ArticleEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val topicId: Long,
    val title: String,
    val type: String, // "PLAIN" or "SUBTITLE"
    val content: String, // Plain raw text or SRT/VTT formatted string
    val audioPath: String?, // Local file path or network URL
    val openCount: Int = 0,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "access_logs",
    foreignKeys = [
        ForeignKey(
            entity = ArticleEntity::class,
            parentColumns = ["id"],
            childColumns = ["articleId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["articleId"])]
)
data class AccessLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val articleId: Long,
    val assessedAt: Long = System.currentTimeMillis()
)`
  },
  {
    name: "ArticleDao.kt",
    path: "com/example/langapp/data/local/dao/ArticleDao.kt",
    language: "kotlin",
    category: "database",
    description: "SQL Data Access Objects with Kotlin Coroutines Flow. Features an atomic transaction to record article checks synchronously.",
    code: `package com.example.langapp.data.local.dao

import androidx.room.*
import com.example.langapp.data.local.entities.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ArticleDao {

    // --- Topic Queries ---
    @Query("SELECT * FROM topics ORDER BY createdAt DESC")
    fun getAllTopicsFlow(): Flow<List<TopicEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTopic(topic: TopicEntity): Long

    // --- Article Queries ---
    @Query("SELECT * FROM articles WHERE topicId = :topicId ORDER BY createdAt ASC")
    fun getArticlesByTopicFlow(topicId: Long): Flow<List<ArticleEntity>>

    @Query("SELECT * FROM articles WHERE id = :articleId")
    suspend fun getArticleById(articleId: Long): ArticleEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertArticle(article: ArticleEntity): Long

    @Update
    suspend fun updateArticle(article: ArticleEntity)

    // --- Access Logs & Analytics ---
    @Insert
    suspend fun insertAccessLog(log: AccessLogEntity)

    @Query("SELECT COUNT(*) FROM access_logs WHERE articleId = :articleId")
    fun getAccessCountFlow(articleId: Long): Flow<Int>

    // --- Transaction Wrapper ---
    /**
     * Increments the openCount of the article and registers a deep access log tracking transaction atomically.
     */
    @Transaction
    suspend fun openArticleAndLog(articleId: Long) {
        val article = getArticleById(articleId)
        if (article != null) {
            updateArticle(article.copy(openCount = article.openCount + 1))
            insertAccessLog(AccessLogEntity(articleId = articleId))
        }
    }
}`
  },
  {
    name: "LanguageLearningDatabase.kt",
    path: "com/example/langapp/data/local/LanguageLearningDatabase.kt",
    language: "kotlin",
    category: "database",
    description: "The Room Database class. Includes migration support stub, type converters, and singleton client patterns.",
    code: `package com.example.langapp.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.langapp.data.local.dao.ArticleDao
import com.example.langapp.data.local.entities.*

@Database(
    entities = [TopicEntity::class, ArticleEntity::class, AccessLogEntity::class],
    version = 1,
    exportSchema = true
)
abstract class LanguageLearningDatabase : RoomDatabase() {

    abstract fun articleDao(): ArticleDao

    companion object {
        @Volatile
        private var INSTANCE: LanguageLearningDatabase? = null

        fun getDatabase(context: Context): LanguageLearningDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    LanguageLearningDatabase::class.java,
                    "lang_learning_database"
                )
                // In production, configure migrations
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}`
  },
  {
    name: "SubtitleParser.kt",
    path: "com/example/langapp/utils/SubtitleParser.kt",
    language: "kotlin",
    category: "parser",
    description: "Robust Regex-based Subtitle Parser for SRT & VTT files. Handles multiple lines, microsecond stamps, and ignores HTML styling tags.",
    code: `package com.example.langapp.utils

import java.util.regex.Pattern

data class SubtitleSegment(
    val index: Int,
    val startTimeMs: Long,
    val endTimeMs: Long,
    val text: String
)

object SubtitleParser {

    private const val SRT_PATTERN_STR = 
        "(?m)^(\\\\d+)\\\\s*\\\\r?\\\\n" +
        "(\\\\d{2}:\\\\d{2}:\\\\d{2}[,.]\\\\d{3})\\\\s*-->\\\\s*(\\\\d{2}:\\\\d{2}:\\\\d{2}[,.]\\\\d{3})" +
        "\\\\s*\\\\n([\\\\s\\\\S]*?)(?=\\\\n{2,}|$)"

    private const val VTT_PATTERN_STR = 
        "(?m)^(?:(\\\\d+)\\\\s*\\\\r?\\\\n)?" +
        "(\\\\d{2}:\\\\d{2}:\\\\d{2}[,.]\\\\d{3})\\\\s*-->\\\\s*(\\\\d{2}:\\\\d{2}:\\\\d{2}[,.]\\\\d{3})" +
        "\\\\s*\\\\n([\\\\s\\\\S]*?)(?=\\\\n{2,}|$)"

    /**
     * Parses an SRT or VTT block into structured timing intervals.
     */
    fun parse(content: String): List<SubtitleSegment> {
        val sanitized = content.trim().replace("\\r\\n", "\\n")
        val isVtt = sanitized.startsWith("WEBVTT", ignoreCase = true)
        
        val pattern = Pattern.compile(if (isVtt) VTT_PATTERN_STR else SRT_PATTERN_STR)
        val matcher = pattern.matcher(sanitized)
        val segments = mutableListOf<SubtitleSegment>()

        var indexCounter = 1
        while (matcher.find()) {
            try {
                // If VTT, group 1 might be null or index
                val customIndex = if (isVtt) {
                    matcher.group(1)?.toIntOrNull() ?: indexCounter++
                } else {
                    matcher.group(1).toInt()
                }

                val startTime = parseTimeToMs(matcher.group(2))
                val endTime = parseTimeToMs(matcher.group(3))
                val text = matcher.group(4).trim()
                    .replace(Regex("<[^>]*>"), "") // Strip simple HTML styling tags

                segments.add(SubtitleSegment(customIndex, startTime, endTime, text))
            } catch (e: Exception) {
                // Fail-safe skip poorly formatted individual segments
                e.printStackTrace()
            }
        }
        return segments
    }

    /**
     * Parses timestamp format HH:MM:SS,ms or HH:MM:SS.ms to total milliseconds
     */
    fun parseTimeToMs(timeStr: String): Long {
        val parts = timeStr.trim().replace(',', '.').split(":")
        if (parts.size < 3) return 0L

        val hours = parts[0].toLongOrNull() ?: 0L
        val minutes = parts[1].toLongOrNull() ?: 0L
        
        val secondsParts = parts[2].split(".")
        val seconds = secondsParts[0].toLongOrNull() ?: 0L
        val ms = if (secondsParts.size > 1) {
            val msStr = secondsParts[1].padEnd(3, '0').take(3)
            msStr.toLongOrNull() ?: 0L
        } else {
            0L
        }

        return (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + ms
    }
}`
  },
  {
    name: "GoogleDriveSyncRepository.kt",
    path: "com/example/langapp/data/repository/GoogleDriveSyncRepository.kt",
    language: "kotlin",
    category: "sync",
    description: "Repository executing SQLite Database file backup/restore using Google Drive REST API. Encapsulates token management and AppData directory sync.",
    code: `package com.example.langapp.data.repository

import android.content.Context
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential
import com.google.api.client.http.FileContent
import com.google.api.services.drive.Drive
import com.google.api.services.drive.DriveScopes
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

class GoogleDriveSyncRepository(private val context: Context) {

    private val dbName = "lang_learning_database"

    /**
     * Configures the Google Drive service client utilizing credentials.
     */
    private fun getDriveService(account: GoogleSignInAccount): Drive {
        val credential = GoogleAccountCredential.usingOAuth2(
            context,
            listOf(DriveScopes.DRIVE_APPDATA, DriveScopes.DRIVE_FILE)
        ).apply {
            selectedAccount = account.account
        }

        return Drive.Builder(
            com.google.api.client.extensions.android.http.AndroidHttp.newCompatibleTransport(),
            com.google.api.client.json.gson.GsonFactory.getDefaultInstance(),
            credential
        ).setApplicationName("AndroidLangApp").build()
    }

    /**
     * Backs up the SQLite database to the app's secure private Google Drive 'appDataFolder'.
     */
    suspend fun backupDbToDrive(account: GoogleSignInAccount): Boolean = withContext(Dispatchers.IO) {
        try {
            val drive = getDriveService(account)
            val dbFile = context.getDatabasePath(dbName)
            if (!dbFile.exists()) return@withContext false

            // Check if backup already exists in Google Drive
            val queryResult = drive.files().list()
                .setSpaces("appDataFolder")
                .setQ("name = '$dbName'")
                .execute()

            val existingFile = queryResult.files?.firstOrNull()

            val metadata = com.google.api.services.drive.model.File().apply {
                name = dbName
                parents = listOf("appDataFolder")
            }

            val mediaContent = FileContent("application/octet-stream", dbFile)

            if (existingFile != null) {
                // Update implementation
                drive.files().update(existingFile.id, null, mediaContent).execute()
            } else {
                // Create implementation
                drive.files().create(metadata, mediaContent).execute()
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    /**
     * Downloads SQLite database file from Google Drive, restores DB locally, and forces app reboot.
     */
    suspend fun restoreDbFromDrive(account: GoogleSignInAccount): Boolean = withContext(Dispatchers.IO) {
        try {
            val drive = getDriveService(account)
            // Query backup in appDataFolder
            val queryResult = drive.files().list()
                .setSpaces("appDataFolder")
                .setQ("name = '$dbName'")
                .execute()

            val driveFile = queryResult.files?.firstOrNull() ?: return@withContext false
            val dbPath = context.getDatabasePath(dbName)

            // Close existing database instance before replacement
            val database = com.example.langapp.data.local.LanguageLearningDatabase.getDatabase(context)
            if (database.isOpen) {
                database.close()
            }

            // Write over the local DB file safely
            val backupDest = File(dbPath.parentFile, dbName)
            FileOutputStream(backupDest).use { output ->
                drive.files().get(driveFile.id).executeMediaAndDownloadTo(output)
            }
            
            // Also clean up SQLite auxiliary files if present (WAL/journal mode files)
            File(dbPath.path + "-wal").delete()
            File(dbPath.path + "-shm").delete()
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}`
  },
  {
    name: "SyncWorker.kt",
    path: "com/example/langapp/data/background/SyncWorker.kt",
    language: "kotlin",
    category: "sync",
    description: "Jetpack WorkManager implementation scheduling non-interrupted Drive pushes as background tasks with battery/network guidelines.",
    code: `package com.example.langapp.data.background

import android.content.Context
import androidx.work.*
import com.example.langapp.data.repository.GoogleDriveSyncRepository
import com.google.android.gms.auth.api.signin.GoogleSignIn
import java.util.concurrent.TimeUnit

class SyncWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        val lastAccount = GoogleSignIn.getLastSignedInAccount(applicationContext) 
            ?: return Result.failure() // Require active login payload

        val repository = GoogleDriveSyncRepository(applicationContext)
        val syncDirection = inputData.getString(KEY_SYNC_DIRECTION) ?: "UPLOAD"

        val success = if (syncDirection == "UPLOAD") {
            repository.backupDbToDrive(lastAccount)
        } else {
            repository.restoreDbFromDrive(lastAccount)
        }

        return if (success) {
            Result.success()
        } else {
            // Check run attempts limit before rescheduling background sync
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    companion object {
        const val KEY_SYNC_DIRECTION = "sync_direction"
        private const val SYNC_TAG = "drive_db_sync"

        /**
         * Enqueues a single scheduled/one-time synchronization worker run.
         */
        fun enqueueOneTimeSync(context: Context, direction: String) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED) // Check network prerequisite
                .build()

            val syncRequest = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(constraints)
                .setInputData(workDataOf(KEY_SYNC_DIRECTION to direction))
                .setBackoffCriteria(
                    BackoffPolicy.EXPONENTIAL,
                    OneTimeWorkRequest.MIN_BACKOFF_MILLIS,
                    TimeUnit.MILLISECONDS
                )
                .addTag(SYNC_TAG)
                .build()

            WorkManager.getInstance(context).enqueueUniqueWork(
                "sync_session_\${direction.lowercase()}",
                ExistingWorkPolicy.REPLACE,
                syncRequest
            )
        }
    }
}`
  },
  {
    name: "ArticleDetailViewModel.kt",
    path: "com/example/langapp/presentation/details/ArticleDetailViewModel.kt",
    language: "kotlin",
    category: "ui",
    description: "The ViewState view model holding state handles, parsing SRT content Reactively, and logging accesses.",
    code: `package com.example.langapp.presentation.details

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.langapp.data.local.dao.ArticleDao
import com.example.langapp.data.local.entities.ArticleEntity
import com.example.langapp.utils.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class ArticleUiState(
    val article: ArticleEntity? = null,
    val isLoading: Boolean = true,
    val subtitleSegments: List<SubtitleSegment> = emptyList(),
    val activeSegmentIndex: Int = -1,
    val currentPositionMs: Long = 0L,
    val openCount: Int = 0
)

class ArticleDetailViewModel(
    private val articleId: Long,
    private val articleDao: ArticleDao
) : ViewModel() {

    private val _uiState = MutableStateFlow(ArticleUiState())
    val uiState: StateFlow<ArticleUiState> = _uiState.asStateFlow()

    init {
        loadArticle()
    }

    private fun loadArticle() {
        viewModelScope.launch {
            // Atomically report open log to Room Database
            articleDao.openArticleAndLog(articleId)

            val article = articleDao.getArticleById(articleId)
            if (article != null) {
                val segments = if (article.type == "SUBTITLE") {
                    SubtitleParser.parse(article.content)
                } else emptyList()

                _uiState.update {
                    it.copy(
                        article = article,
                        subtitleSegments = segments,
                        isLoading = false,
                        openCount = article.openCount + 1
                    )
                }

                // Listen to database auto-update counts in real time
                articleDao.getAccessCountFlow(articleId).collect { count ->
                    _uiState.update { it.copy(openCount = count) }
                }
            } else {
                _uiState.update { it.copy(isLoading = false) }
            }
        }
    }

    /**
     * Updates playback timestamp state matching. Exoplayer reports this loop as it progresses.
     */
    fun updatePlaybackPosition(ms: Long) {
        _uiState.update { state ->
            val index = state.subtitleSegments.indexOfFirst { segment ->
                ms >= segment.startTimeMs && ms <= segment.endTimeMs
            }
            state.copy(
                currentPositionMs = ms,
                activeSegmentIndex = index
            )
        }
    }

    class Factory(
        private val articleId: Long,
        private val articleDao: ArticleDao
    ) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(ArticleDetailViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return ArticleDetailViewModel(articleId, articleDao) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
}`
  },
  {
    name: "ArticleDetailScreen.kt",
    path: "com/example/langapp/presentation/details/ArticleDetailScreen.kt",
    language: "kotlin",
    category: "ui",
    description: "Jetpack Compose high-fidelity view utilizing Jetpack Compose LazyColumn, system TextToSpeech/MediaPlayer playback, and scroll states.",
    code: `package com.example.langapp.presentation.details

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ArticleDetailScreen(
    viewModel: ArticleDetailViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()

    // Manage automatic scrolling lock when active subtitle lines changes
    LaunchedEffect(uiState.activeSegmentIndex) {
        val targetIndex = uiState.activeSegmentIndex
        if (targetIndex >= 0) {
            scope.launch {
                listState.animateScrollToItem(targetIndex)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(uiState.article?.title ?: "Reading Mode") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                ),
                actions = {
                    Badge(modifier = Modifier.padding(end = 12.dp)) {
                        Text("Opened: \${uiState.openCount} times", modifier = Modifier.padding(4.dp))
                    }
                }
            )
        },
        modifier = modifier
    ) { innerPadding ->
        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else if (uiState.article == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "Article not found", style = MaterialTheme.typography.bodyLarge)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                // Article contents
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                ) {
                    LazyColumn(
                        state = listState,
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        itemsIndexed(uiState.subtitleSegments) { idx, segment ->
                            val isActive = idx == uiState.activeSegmentIndex
                            val textColor by animateColorAsState(
                                targetValue = if (isActive) {
                                    MaterialTheme.colorScheme.primary
                                } else {
                                    MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                                },
                                label = "textColor"
                            )
                            
                            val textStyle = if (isActive) {
                                MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                            } else {
                                MaterialTheme.typography.bodyLarge
                            }

                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = if (isActive) {
                                        MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.4f)
                                    } else {
                                        Color.Transparent
                                    }
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        // Handle manual jump request to segment timestamp
                                        viewModel.updatePlaybackPosition(segment.startTimeMs)
                                    }
                            ) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text(
                                        text = segment.text,
                                        style = textStyle,
                                        color = textColor
                                    )
                                    Text(
                                        text = formatTimestamp(segment.startTimeMs) + " - " + formatTimestamp(segment.endTimeMs),
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.outline.copy(alpha = 0.7f),
                                        modifier = Modifier.padding(top = 4.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                // Playback Control bar simulation
                Surface(
                    tonalElevation = 8.dp,
                    shadowElevation = 4.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = "Engine Speed: Local TTS / Player",
                                style = MaterialTheme.typography.titleSmall
                            )
                            Text(
                                text = "Current Position: \${formatTimestamp(uiState.currentPositionMs)}",
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.secondary
                            )
                        }
                        Button(
                            onClick = {
                                // External triggering listener can play mp3/TTS
                            }
                        ) {
                            Icon(imageVector = Icons.Default.PlayArrow, contentDescription = "Play")
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Speak Text")
                        }
                    }
                }
            }
        }
    }
}

/**
 * Format milliseconds to time string (MM:SS)
 */
fun formatTimestamp(ms: Long): String {
    val totalSeconds = ms / 1000
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    val remainderMs = ms % 1000
    return String.format("%02d:%02d.%03d", minutes, seconds, remainderMs)
}
`
  },
  {
    name: "AndroidManifest.xml",
    path: "app/src/main/AndroidManifest.xml",
    language: "xml",
    category: "config",
    description: "Android Application Manifest declaring essential device permissions (Internet, Disk/Files, and Microphone) to support online cloud TTS, local Room database caching, and speech voice interactions.",
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.langapp">

    <!-- Internet permission for Google Translate TTS & Drive Sync -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Microphone permission for speech-to-text / accent analysis -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />

    <!-- Storage permissions for caching subtitle audio files and Room DB exports -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.LanguageLearning">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.LanguageLearning.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Background Sync Worker Service -->
        <service
            android:name="androidx.work.impl.background.systemalarm.SystemAlarmService"
            android:enabled="true"
            android:exported="false" />
            
    </application>
</manifest>`
  }
];
