package com.loom.backend.controller;

import com.loom.backend.model.LogEntry;
import com.loom.backend.repository.LogEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/logs")
public class LogController {

    @Autowired
    LogEntryRepository logEntryRepository;

    @GetMapping
    public ResponseEntity<Page<LogEntry>> getAllLogs(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "timestamp,desc") String[] sort) {

        String sortField = sort[0];
        String sortDirection = sort.length > 1 ? sort[1] : "asc";
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable paging = PageRequest.of(page, size, Sort.by(direction, sortField));

        org.springframework.data.jpa.domain.Specification<LogEntry> spec = com.loom.backend.repository.LogSpecification
                .getSpecs(level, source, search, startDate, endDate);
        Page<LogEntry> pageLogs = logEntryRepository.findAll(spec, paging);

        return ResponseEntity.ok(pageLogs);
    }

    @PostMapping
    public ResponseEntity<LogEntry> createLog(@RequestBody LogEntry log) {
        if (log.getTimestamp() == null) {
            log.setTimestamp(LocalDateTime.now());
        }
        LogEntry _log = logEntryRepository.save(log);
        return ResponseEntity.ok(_log);
    }
}
