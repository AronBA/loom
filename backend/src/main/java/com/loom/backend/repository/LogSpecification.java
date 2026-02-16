package com.loom.backend.repository;

import com.loom.backend.model.LogEntry;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;

public class LogSpecification {
    public static Specification<LogEntry> getSpecs(String level, String source, String search, LocalDateTime startDate,
            LocalDateTime endDate) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(level)) {
                predicates.add(criteriaBuilder.equal(root.get("level"), level));
            }

            if (StringUtils.hasText(source)) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("source")),
                        "%" + source.toLowerCase() + "%"));
            }

            if (StringUtils.hasText(search)) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("message")),
                        "%" + search.toLowerCase() + "%"));
            }

            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("timestamp"), startDate));
            }

            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("timestamp"), endDate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
