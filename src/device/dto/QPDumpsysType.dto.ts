import { ApiProperty } from '@nestjs/swagger';
import { StartServiceOptions } from '@u4/adbkit';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { QPSerialDto } from './QPSerial.dto';

export const DUMPSYS_TYPES = [
  'DockObserver',
  'OnePlusExService',
  'ParamService',
  'SurfaceFlinger',
  'accessibility',
  'account',
  'activity',
  'activity_task',
  'adb',
  'alarm',
  'android.hardware.power.IPower/default',
  'android.hardware.vibrator.IVibrator/default',
  'android.os.UpdateEngineService',
  'android.security.identity',
  'android.security.keystore',
  'api_adapter_service',
  'app_binding',
  'app_integrity',
  'appops',
  'appwidget',
  'audio',
  'auth',
  'autofill',
  'backup',
  'battery',
  'batteryproperties',
  'batterystats',
  'binder_calls_stats',
  'biometric',
  'blob_store',
  'bluetooth_manager',
  'bugreport',
  'cacheinfo',
  'carrier_config',
  'clipboard',
  'color_display',
  'companiondevice',
  'connectivity',
  'connmetrics',
  'consumer_ir',
  'content',
  'country_detector',
  'cpuinfo',
  'crossprofileapps',
  'dataloader_manager',
  'dbinfo',
  'device_config',
  'device_identifiers',
  'device_policy',
  'deviceidle',
  'devicestoragemonitor',
  'diskstats',
  'display',
  'display.smomoservice',
  'dpmservice',
  'dreams',
  'drm.drmManager',
  'dropbox',
  'dynamic_system',
  'emergency_affordance',
  'engineer',
  'ethernet',
  'external_vibrator_service',
  'extphone',
  'file_integrity',
  'fingerprint',
  'game_vibrate_service',
  'gfxinfo',
  'gpu',
  'graphicsstats',
  'hardware_properties',
  'horae',
  'houston_server',
  'hypnus',
  'imms',
  'incidentcompanion',
  'incremental',
  'input',
  'input_method',
  'inputflinger',
  'ions',
  'iphonesubinfo',
  'ipsec',
  'isms',
  'isub',
  'jobscheduler',
  'launcherapps',
  'lights',
  'location',
  'lock_settings',
  'looper_stats',
  'manager',
  'media.aaudio',
  'media.audio_flinger',
  'media.audio_policy',
  'media.camera',
  'media.camera.proxy',
  'media.extractor',
  'media.metrics',
  'media.player',
  'media.resource_manager',
  'media_projection',
  'media_resource_monitor',
  'media_router',
  'media_session',
  'meminfo',
  'midi',
  'mount',
  'netd_listener',
  'netpolicy',
  'netstats',
  'network_management',
  'network_score',
  'network_stack',
  'network_time_update_service',
  'network_watchlist',
  'notification',
  'oem_lock',
  'oimc_service',
  'oneplus_bluetooth_service',
  'oneplus_colordisplay_service',
  'oneplus_longshot_manager_service',
  'oneplus_nfc_service',
  'oneplus_wifi_service',
  'oneplus_windowmanagerservice',
  'op.hans.IHansComunication',
  'opdiagnose',
  'opscenecallblock',
  'opscreenmode',
  'opservice',
  'otadexopt',
  'overlay',
  'package',
  'package_native',
  'permission',
  'permissionmgr',
  'persistent_data_block',
  'phone',
  'pinner',
  'platform_compat',
  'platform_compat_native',
  'power',
  'powercontrol',
  'print',
  'processinfo',
  'procstats',
  'qti.radio.extphone',
  'recovery',
  'restrictions',
  'role',
  'rollback',
  'runtime',
  'scheduling_policy',
  'search',
  'sec_key_att_app_id_provider',
  'secrecy',
  'secure_element',
  'sensor_privacy',
  'sensorservice',
  'serial',
  'servicediscovery',
  'settings',
  'shortcut',
  'simphonebook',
  'sip',
  'slice',
  'soundtrigger',
  'soundtrigger_middleware',
  'stats',
  'statscompanion',
  'statsmanager',
  'statusbar',
  'storaged',
  'storaged_pri',
  'storagestats',
  'system_config',
  'system_update',
  'telecom',
  'telephony.registry',
  'telephony_ims',
  'testharness',
  'tethering',
  'textclassification',
  'textservices',
  'thermalservice',
  'time_detector',
  'time_zone_detector',
  'trust',
  'uce',
  'uimode',
  'updatelock',
  'uri_grants',
  'usagestats',
  'usb',
  'user',
  'vendor.audio.vrservice',
  'vendor.perfservice',
  'vendor.qspmsvc',
  'vibrator',
  'voiceinteraction',
  'wallpaper',
  'webviewupdate',
  'wifi',
  'wifinl80211',
  'wifip2p',
  'wifiscanner',
  'window  ',
] as const;
export type DumpSysType = typeof DUMPSYS_TYPES[number];
/**
 * use as a body
 */
export class QPDumpsysTypeDto extends QPSerialDto {
  @IsString()
  @IsEnum(DUMPSYS_TYPES)
  @ApiProperty({
    title: 'type',
    description: 'Sysdump type',
    required: true,
    enum: DUMPSYS_TYPES,
    type: String,
  })
  type!: DumpSysType;
}
