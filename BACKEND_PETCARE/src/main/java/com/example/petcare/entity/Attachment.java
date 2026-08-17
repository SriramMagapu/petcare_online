package com.example.petcare.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "attachments")
public class Attachment {
    @Id
    @Column(length = 36)
    private String id = UUID.randomUUID().toString();

    // could be record_id or vaccination_id depending on use; we'll use record_id for medical attachments
    @Column(name = "record_id")
    private String recordId;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "stored_filename")
    private String storedFilename;

    @Column(name = "content_type")
    private String contentType;

    private Long size;

    public Attachment() {}

    // getters & setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRecordId() { return recordId; }
    public void setRecordId(String recordId) { this.recordId = recordId; }
    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
    public String getStoredFilename() { return storedFilename; }
    public void setStoredFilename(String storedFilename) { this.storedFilename = storedFilename; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public Long getSize() { return size; }
    public void setSize(Long size) { this.size = size; }
}
