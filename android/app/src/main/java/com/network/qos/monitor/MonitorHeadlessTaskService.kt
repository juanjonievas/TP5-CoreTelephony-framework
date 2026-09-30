package com.network.qos.monitor

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class MonitorHeadlessTaskService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        return HeadlessJsTaskConfig(
            "BackgroundMeasurementTask",
            null,
            60000, // Timeout (60s)
            true // Allowed in foreground
        )
    }
}
