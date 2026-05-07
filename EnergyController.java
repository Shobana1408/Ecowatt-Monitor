package com.ecowatt.web;

import com.ecowatt.entity.EnergyData;
import com.ecowatt.service.EnergyDataService;
import com.ecowatt.web.dto.SummaryResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class EnergyController {

    private final EnergyDataService energyDataService;

    public EnergyController(EnergyDataService energyDataService) {
        this.energyDataService = energyDataService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadCsv(@RequestPart("file") MultipartFile file) throws IOException {
        energyDataService.uploadCsv(file);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/data")
    public List<EnergyData> getAll() {
        return energyDataService.findAll();
    }

    @GetMapping("/summary")
    public SummaryResponse summary() {
        return energyDataService.getSummary();
    }
}


