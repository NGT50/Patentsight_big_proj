package com.patentsight.file.dto;

/**
 * Response for restoring a document version which creates a new version.
 */
public class RestoreVersionResponse {
    private Long patentId;
    private Long versionId;
    private int newVersionNo;
    private Long restoredFrom;

    public Long getPatentId() { return patentId; }
    public void setPatentId(Long patentId) { this.patentId = patentId; }

    public Long getVersionId() { return versionId; }
    public void setVersionId(Long versionId) { this.versionId = versionId; }

    public int getNewVersionNo() { return newVersionNo; }
    public void setNewVersionNo(int newVersionNo) { this.newVersionNo = newVersionNo; }

    public Long getRestoredFrom() { return restoredFrom; }
    public void setRestoredFrom(Long restoredFrom) { this.restoredFrom = restoredFrom; }

    // no timestamps required in minimal response
}
