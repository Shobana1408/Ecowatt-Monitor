package com.ecowatt.service;

import com.ecowatt.entity.EnergyData;
import com.ecowatt.web.dto.SummaryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface EnergyDataService {
    void uploadCsv(MultipartFile file) throws IOException;
    List<EnergyData> findAll();
    SummaryResponse getSummary();
}


