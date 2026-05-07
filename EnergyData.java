package com.ecowatt.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "energy_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnergyData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private double solarGeneration;

    @Column(nullable = false)
    private double windGeneration;

    @Column(nullable = false)
    private double consumption;

    @Column(nullable = false)
    private double totalRenewable;

    @Column(nullable = false)
    private double energyBalance;

    @Column(nullable = false)
    private double renewablePercentage;
}


