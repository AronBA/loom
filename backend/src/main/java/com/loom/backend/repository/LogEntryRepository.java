package com.loom.backend.repository;

import com.loom.backend.model.LogEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LogEntryRepository extends JpaRepository<LogEntry, Long>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<LogEntry> {
    // Custom query methods are no longer needed as we will use Specifications
}
