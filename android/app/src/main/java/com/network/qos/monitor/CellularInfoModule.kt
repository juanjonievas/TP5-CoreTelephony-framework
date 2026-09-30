package com.network.qos.monitor

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.telephony.TelephonyManager
import android.telephony.CellInfo
import android.telephony.CellInfoLte
import android.telephony.CellInfoWcdma
import android.telephony.CellInfoGsm
import android.telephony.CellInfoCdma
import android.os.Build
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments

class CellularInfoModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "CellularInfoModule"
    }

    @ReactMethod
    fun getCellularInfo(promise: Promise) {
        val telephonyManager = reactApplicationContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        val map: WritableMap = Arguments.createMap()

        try {
            val operatorName = telephonyManager.networkOperatorName
            map.putString("operator", if (operatorName.isNotEmpty()) operatorName else null)
            
            // Requerimos ACCESS_FINE_LOCATION o ACCESS_COARSE_LOCATION para leer CellInfo
            if (ContextCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                val cellInfoList: List<CellInfo>? = telephonyManager.allCellInfo
                var maxRssi: Int? = null
                
                if (cellInfoList != null) {
                    for (cellInfo in cellInfoList) {
                        if (cellInfo.isRegistered) {
                            val rssi = when (cellInfo) {
                                is CellInfoLte -> cellInfo.cellSignalStrength.dbm
                                is CellInfoWcdma -> cellInfo.cellSignalStrength.dbm
                                is CellInfoGsm -> cellInfo.cellSignalStrength.dbm
                                is CellInfoCdma -> cellInfo.cellSignalStrength.dbm
                                else -> null
                            }
                            if (rssi != null && rssi < 0) {
                                maxRssi = rssi
                                break
                            }
                        }
                    }
                }
                if (maxRssi != null) {
                    map.putInt("rssi", maxRssi)
                } else {
                    map.putNull("rssi")
                }
            } else {
                map.putNull("rssi")
            }

            // Para simplificar, pasamos el networkType general
            map.putString("networkType", "cellular")

            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("CELLULAR_INFO_ERROR", e.message)
        }
    }
}
