package com.civictech.core.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface CitizenFeedbackRepository extends JpaRepository<CitizenFeedback, Long> {
    
    @Query(value = "SELECT * FROM citizen_feedback WHERE cosine_similarity(embedding, cast(:embedding as float8[])) > :threshold AND id != :excludeId ORDER BY cosine_similarity(embedding, cast(:embedding as float8[])) DESC LIMIT 5", nativeQuery = true)
    List<CitizenFeedback> findSimilarFeedback(@Param("embedding") String embeddingArrayStr, @Param("threshold") double threshold, @Param("excludeId") long excludeId);
}
