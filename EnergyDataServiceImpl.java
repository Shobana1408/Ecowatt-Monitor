package com.ecowatt.service;

import com.ecowatt.entity.EnergyData;
import com.ecowatt.repository.EnergyDataRepository;
import com.ecowatt.web.dto.SummaryResponse;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
public class EnergyDataServiceImpl implements EnergyDataService {

    private final EnergyDataRepository energyDataRepository;

    public EnergyDataServiceImpl(EnergyDataRepository energyDataRepository) {
        this.energyDataRepository = energyDataRepository;
    }

    @Override
    @Transactional
    public void uploadCsv(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is required");
        }

        List<EnergyData> batch = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser parser = new CSVParser(reader, CSVFormat.DEFAULT.builder()
                 .setHeader("solar_generation", "wind_generation", "consumption", "timestamp")
                 .setSkipHeaderRecord(true)
                 .setIgnoreEmptyLines(true)
                 .setTrim(true)
                 .build())) {

            for (CSVRecord record : parser) {
                try {
                    double solar = parseNonNegativeDouble(record, "solar_generation");
                    double wind = parseNonNegativeDouble(record, "wind_generation");
                    double consumption = parseNonNegativeDouble(record, "consumption");
                    LocalDateTime timestamp = parseTimestamp(record, "timestamp");

                    double totalRenewable = solar + wind;
                    double energyBalance = totalRenewable - consumption;
                    double renewablePercentage = consumption == 0.0 ? 0.0 : (totalRenewable / consumption) * 100.0;

                    EnergyData data = EnergyData.builder()
                        .timestamp(timestamp)
                        .solarGeneration(solar)
                        .windGeneration(wind)
                        .consumption(consumption)
                        .totalRenewable(totalRenewable)
                        .energyBalance(energyBalance)
                        .renewablePercentage(renewablePercentage)
                        .build();
                    batch.add(data);
                } catch (IllegalArgumentException | DateTimeParseException ex) {
                    // Skip invalid rows but continue processing others
                }
            }
        }

        if (!batch.isEmpty()) {
            energyDataRepository.saveAll(batch);
        }
    }

    private static double parseNonNegativeDouble(CSVRecord record, String header) {
        String value = record.get(header);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Missing value for " + header);
        }
        double parsed = Double.parseDouble(value);
        if (parsed < 0) {
            throw new IllegalArgumentException("Negative value for " + header);
        }
        return parsed;
    }

    private static LocalDateTime parseTimestamp(CSVRecord record, String header) {
        String value = record.get(header);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Missing value for " + header);
        }
        return LocalDateTime.parse(value);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnergyData> findAll() {
        return energyDataRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public SummaryResponse getSummary() {
        List<EnergyData> all = energyDataRepository.findAll();
        double totalSolar = 0.0;
        double totalWind = 0.0;
        double totalConsumption = 0.0;
        double sumRenewablePercentage = 0.0;

        for (EnergyData d : all) {
            totalSolar += d.getSolarGeneration();
            totalWind += d.getWindGeneration();
            totalConsumption += d.getConsumption();
            sumRenewablePercentage += d.getRenewablePercentage();
        }

        double avgRenewablePercentage = all.isEmpty() ? 0.0 : (sumRenewablePercentage / all.size());
        double netBalance = totalSolar + totalWind - totalConsumption;

        return new SummaryResponse(totalSolar, totalWind, totalConsumption, avgRenewablePercentage, netBalance);
    }
}


