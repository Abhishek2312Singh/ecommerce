package com.smartparkhub.backend.service;

import com.smartparkhub.backend.entity.Slot;
import com.smartparkhub.backend.repository.SlotRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SlotService {

    @Autowired private SlotRepo slotRepo;

    public List<Slot> getAllSlots() {
        return slotRepo.findAll();
    }

    public List<Slot> getSlotsByCampus(String campusKey) {
        return slotRepo.findByCampusKey(campusKey);
    }

    public Slot createSlot(Slot slot) {
        return slotRepo.save(slot);
    }

    public Slot updateSlot(Long id, Boolean occupied) {
        Slot slot = slotRepo.findById(id).orElseThrow();
        slot.setOccupied(occupied);
        return slotRepo.save(slot);
    }

    public List<Slot> getSlotsByZone(String zone) {
        return slotRepo.findByZone(zone);
    }

    public List<Slot> getSlotsByType(String type) {
        return slotRepo.findByType(type);
    }

    public long getAvailableSlots() {
        return slotRepo.countByOccupied(false);
    }

    public long getOccupiedSlots() {
        return slotRepo.countByOccupied(true);
    }

    public long getAvailableSlotsByCampus(String campusKey) {
        return slotRepo.countByCampusKeyAndOccupied(campusKey, false);
    }

    public long getOccupiedSlotsByCampus(String campusKey) {
        return slotRepo.countByCampusKeyAndOccupied(campusKey, true);
    }
}
