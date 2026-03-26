package com.github.nrfr.data

object PresetCarriers {
    data class CarrierPreset(
        val name: String,
        val displayName: String,
        val region: String
    )

    val presets = listOf(
        // China Mainland carriers
        CarrierPreset("China Mobile", "China Mobile", "CN"),
        CarrierPreset("China Unicom", "China Unicom", "CN"),
        CarrierPreset("China Telecom", "China Telecom", "CN"),

        // Hong Kong carriers
        CarrierPreset("CMHK", "CMHK", "HK"),
        CarrierPreset("HKT", "HKT", "HK"),
        CarrierPreset("3HK", "3HK", "HK"),
        CarrierPreset("SmarTone", "SmarTone", "HK"),

        // Macau carriers
        CarrierPreset("CTM", "CTM", "MO"),
        CarrierPreset("3 Macau", "3 Macau", "MO"),

        // Taiwan carriers
        CarrierPreset("Chunghwa Telecom", "Chunghwa Telecom", "TW"),
        CarrierPreset("Taiwan Mobile", "Taiwan Mobile", "TW"),
        CarrierPreset("FarEasTone", "FarEasTone", "TW"),

        // Japan carriers
        CarrierPreset("NTT docomo", "NTT docomo", "JP"),
        CarrierPreset("au", "au by KDDI", "JP"),
        CarrierPreset("Softbank", "Softbank", "JP"),
        CarrierPreset("Rakuten", "Rakuten Mobile", "JP"),

        // South Korea carriers
        CarrierPreset("SK Telecom", "SK Telecom", "KR"),
        CarrierPreset("KT", "KT Corporation", "KR"),
        CarrierPreset("LG U+", "LG U+", "KR"),

        // United States carriers
        CarrierPreset("AT&T", "AT&T", "US"),
        CarrierPreset("T-Mobile", "T-Mobile USA", "US"),
        CarrierPreset("Verizon", "Verizon", "US"),
        CarrierPreset("Sprint", "Sprint", "US"),

        // United Kingdom carriers
        CarrierPreset("EE", "EE", "GB"),
        CarrierPreset("O2", "O2 UK", "GB"),
        CarrierPreset("Three", "Three UK", "GB"),
        CarrierPreset("Vodafone", "Vodafone UK", "GB"),

        // Singapore carriers
        CarrierPreset("Singtel", "Singtel", "SG"),
        CarrierPreset("StarHub", "StarHub", "SG"),
        CarrierPreset("M1", "M1", "SG"),

        // Malaysia carriers
        CarrierPreset("Maxis", "Maxis", "MY"),
        CarrierPreset("Celcom", "Celcom", "MY"),
        CarrierPreset("Digi", "Digi", "MY"),
        CarrierPreset("U Mobile", "U Mobile", "MY"),

        // Thailand carriers
        CarrierPreset("AIS", "AIS", "TH"),
        CarrierPreset("DTAC", "DTAC", "TH"),
        CarrierPreset("True Move H", "True Move H", "TH"),

        // Vietnam carriers
        CarrierPreset("Viettel", "Viettel Mobile", "VN"),
        CarrierPreset("Vinaphone", "Vinaphone", "VN"),
        CarrierPreset("Mobifone", "Mobifone", "VN"),

        // Indonesia carriers
        CarrierPreset("Telkomsel", "Telkomsel", "ID"),
        CarrierPreset("Indosat", "Indosat Ooredoo", "ID"),
        CarrierPreset("XL Axiata", "XL Axiata", "ID"),

        // Philippines carriers
        CarrierPreset("Globe", "Globe Telecom", "PH"),
        CarrierPreset("Smart", "Smart Communications", "PH"),
        CarrierPreset("DITO", "DITO Telecommunity", "PH"),

        // India carriers
        CarrierPreset("Jio", "Reliance Jio", "IN"),
        CarrierPreset("Airtel", "Bharti Airtel", "IN"),
        CarrierPreset("Vi", "Vodafone Idea", "IN"),

        // Australia carriers
        CarrierPreset("Telstra", "Telstra", "AU"),
        CarrierPreset("Optus", "Optus", "AU"),
        CarrierPreset("Vodafone", "Vodafone AU", "AU"),

        // Canada carriers
        CarrierPreset("Bell", "Bell Mobility", "CA"),
        CarrierPreset("Rogers", "Rogers Wireless", "CA"),
        CarrierPreset("Telus", "Telus Mobility", "CA"),

        // Germany carriers
        CarrierPreset("Telekom", "T-Mobile DE", "DE"),
        CarrierPreset("Vodafone", "Vodafone DE", "DE"),
        CarrierPreset("O2", "O2 DE", "DE"),

        // France carriers
        CarrierPreset("Orange", "Orange FR", "FR"),
        CarrierPreset("SFR", "SFR", "FR"),
        CarrierPreset("Free", "Free Mobile", "FR"),
        CarrierPreset("Bouygues", "Bouygues Telecom", "FR"),

        // Italy carriers
        CarrierPreset("TIM", "Telecom Italia", "IT"),
        CarrierPreset("Vodafone", "Vodafone IT", "IT"),
        CarrierPreset("Wind Tre", "Wind Tre", "IT"),

        // Spain carriers
        CarrierPreset("Movistar", "Movistar", "ES"),
        CarrierPreset("Vodafone", "Vodafone ES", "ES"),
        CarrierPreset("Orange", "Orange ES", "ES"),

        // Russia carriers
        CarrierPreset("MTS", "MTS", "RU"),
        CarrierPreset("MegaFon", "MegaFon", "RU"),
        CarrierPreset("Beeline", "Beeline", "RU"),

        // Brazil carriers
        CarrierPreset("Vivo", "Vivo", "BR"),
        CarrierPreset("Claro", "Claro", "BR"),
        CarrierPreset("TIM", "TIM Brasil", "BR"),

        // Custom option
        CarrierPreset("Custom", "", "")
    )
}
