-- Ensure patent.status reflects review.decision changes
DROP TRIGGER IF EXISTS review_decision_update//
CREATE TRIGGER review_decision_update
AFTER UPDATE ON review
FOR EACH ROW
BEGIN
    IF NEW.decision <> OLD.decision THEN
        UPDATE patent
        SET status = CASE NEW.decision
            WHEN 'SUBMITTED' THEN 'SUBMITTED'
            WHEN 'REVIEWING' THEN 'REVIEWING'
            WHEN 'APPROVE' THEN 'APPROVED'
            WHEN 'REJECT' THEN 'REJECTED'
        END
        WHERE patent_id = NEW.patent_id;
    END IF;
END//

DROP TRIGGER IF EXISTS review_decision_insert//
CREATE TRIGGER review_decision_insert
AFTER INSERT ON review
FOR EACH ROW
BEGIN
    UPDATE patent
    SET status = CASE NEW.decision
        WHEN 'SUBMITTED' THEN 'SUBMITTED'
        WHEN 'REVIEWING' THEN 'REVIEWING'
        WHEN 'APPROVE' THEN 'APPROVED'
        WHEN 'REJECT' THEN 'REJECTED'
    END
    WHERE patent_id = NEW.patent_id;
END//
