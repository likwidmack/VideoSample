/* UX configuration example
 * This object can be created before the player is loaded into the page
 * All configuration is optional and will be merged with players default configuration from configuration.js
 */
window.$ndp = {};
//window.ndp_ref_PDK_VERSION = window['ndp_ref_PDK_VERSION'] || '5.6.18';
window.base_pdk_url = location.protocol + '//media1.s-nbcnews.com/i/videoassets/pdk/';
$ndp.configuration = {
    adpolicy: 35810,
    freewheel: {
        adManagerUrl: location.protocol + "//media1.s-nbcnews.com/i/videoassets/pdk/vendor/AdManager-6.5.0.r1.{ext}",
        logLevel: 2,
        nativeProfileId: "nbcnews_html5_live_https",
        network: 171224,
        playerProfile: "nbcnews_{runtime}_live_https",
        requestTimeout: 7000,
        siteSection: "Today_Show_2015_Test_Site_Section",
        siteSectionFallbackID: 853951,
        url: location.protocol + "//29cd8.v.fwmrm.net/ad/g/1?",
        videoAssetFallbackID: 64299682
    },
    useCustomControls: window['useCustomControlRack'],
    location: 'playerOne',
    pdk: {
        skin: {
            version: "brushed",
            url: window.base_pdk_url + "default_skin/brushed2.json"
        },
        layout: {
            version: "default",
            url: window.base_pdk_url + "default_layout/metaLayout_brushed.xml"
        }
    }
};

if (window['ndp_ref_PDK_VERSION']) {
    $ndp.configuration.pdk.source = {
        version: window.ndp_ref_PDK_VERSION,
        url: window.base_pdk_url + window.ndp_ref_PDK_VERSION + '/'
    };
}

if ($page && $page.data && $page.data.ads) {
    var _short = $ndp.configuration.freewheel;
    if ($page.data.brand === 'today') {
        //_short.network = 169843;
        //_short.siteSectionFallbackID = 884196;
        //_short.videoAssetFallbackID = 90320017;
    } else {
        _short.network = 169843;
        _short.siteSectionFallbackID = 884078;
        _short.videoAssetFallbackID = 90319997;
    }
}
