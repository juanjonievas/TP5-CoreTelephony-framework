package com.network.qos.monitor

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.facebook.react.HeadlessJsTaskService

class MonitorService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private val runnable = object : Runnable {
        override fun run() {
            val serviceIntent = Intent(applicationContext, MonitorHeadlessTaskService::class.java)
            applicationContext.startService(serviceIntent)
            HeadlessJsTaskService.acquireWakeLockNow(applicationContext)
            
            // Repetir cada 15 minutos
            handler.postDelayed(this, 15 * 60 * 1000) 
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        createNotificationChannel()
        val notification = NotificationCompat.Builder(this, "MONITOR_CHANNEL")
            .setContentTitle("QoS Monitor")
            .setContentText("Midiendo calidad de red en segundo plano")
            .setSmallIcon(applicationContext.applicationInfo.icon)
            .build()
        
        startForeground(1, notification)
        
        handler.post(runnable)
        return START_STICKY
    }

    override fun onDestroy() {
        handler.removeCallbacks(runnable)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "MONITOR_CHANNEL",
                "Monitoreo de Red",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }
}
