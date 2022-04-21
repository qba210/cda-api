export interface PlayerData {
    id:               string;
    ads:              PlayerData_Ads;
    video:            PlayerData_Video;
    nextVideo:        PlayerData_NextVideo;
    autoplay:         boolean;
    seekTo:           number;
    premium:          boolean;
    api:              PlayerData_API;
    user:             PlayerData_User;
    plista:           boolean;
    adOnPauseEnabled: boolean;
    adOnPauseElement: string;
}

export interface PlayerData_Ads {
    schedule: PlayerData_Ads_Schedule[];
}

export interface PlayerData_Ads_Schedule {
    enabled:     boolean;
    counter:     boolean;
    skip:        boolean;
    click:       boolean;
    key:         string;
    tag:         string;
    tagAdblock?: string;
    repeat:      number;
    time:        number;
    type:        string;
    displayAs:   string;
    safe:        boolean;
}

export interface PlayerData_API {
    client:  string;
    client2: string;
    ts:      string;
    key:     string;
    method:  string;
}

export interface PlayerData_NextVideo {
    id:      string;
    title:   string;
    thumb:   string;
    user:    string;
    quality: null;
    link:    string;
}

export interface PlayerData_User {
    role:          string;
    id:            number;
    uid:           string;
    gender:        string;
    video_history: boolean;
}

export interface PlayerData_Video {
    id:                             string;
    file:                           string;
    file_cast:                      null;
    cast_available:                 boolean;
    manifest:                       null;
    manifest_cast:                  null;
    manifest_drm_proxy:             null;
    manifest_drm_header:            null;
    manifest_drm_pr_proxy:          null;
    manifest_drm_pr_header:         null;
    manifest_apple:                 null;
    manifest_drm_apple_certificate: null;
    manifest_drm_apple_license:     null;
    manifest_audio_stereo_bitrate:  number;
    manifest_forced_audio_hd:       boolean;
    manifest_auto_quality:          boolean;
    duration:                       string;
    durationFull:                   string;
    poster:                         string;
    type:                           string;
    video_promoted:                 boolean;
    width:                          number;
    height:                         number;
    content_rating:                 null;
    quality:                        string;
    qualities:                      { [key: string]: string };
    quality_change_in_player:       boolean;
    ts:                             number;
    hash:                           string;
    hash2:                          string;
    premium_categories:             string;
    title:                          string;
    thumb:                          string;
}