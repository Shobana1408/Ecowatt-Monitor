package com.ecowatt.web.dto;

public record SummaryResponse(
    double totalSolar,
    double totalWind,
    double totalConsumption,
    double avgRenewablePercentage,
    double netBalance
) {}


