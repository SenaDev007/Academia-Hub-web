-- ============================================================================
-- FONCTIONS SQL CRITIQUES - ACADEMIA HUB
-- ============================================================================
-- 
-- Fonctions helper pour les triggers de règles métier
-- Ces fonctions sont utilisées par les triggers dans triggers.sql
-- 
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FONCTION : Vérifier priorité allocation paiement
-- ----------------------------------------------------------------------------
-- Vérifie que l'allocationOrder respecte la priorité :
-- ARREAR (allocationOrder = 1) > INSCRIPTION/REINSCRIPTION (2-10) > SCOLARITE (11+)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION check_payment_allocation_priority()
RETURNS TRIGGER AS $$
DECLARE
  v_min_arrear_order INTEGER;
  v_max_non_arrear_order INTEGER;
BEGIN
  -- Si targetType = 'ARREAR', allocationOrder doit être 1 (priorité maximale)
  IF NEW."targetType" = 'ARREAR' AND NEW."allocationOrder" != 1 THEN
    RAISE EXCEPTION 'Les arriérés doivent avoir allocationOrder = 1 (priorité maximale). Valeur reçue: %', NEW."allocationOrder";
  END IF;

  -- Si targetType != 'ARREAR', allocationOrder doit être >= 2
  IF NEW."targetType" != 'ARREAR' AND NEW."allocationOrder" < 2 THEN
    RAISE EXCEPTION 'Les allocations non-arriérés doivent avoir allocationOrder >= 2. Valeur reçue: %', NEW."allocationOrder";
  END IF;

  -- Vérifier qu'il n'existe pas d'arriéré avec un ordre supérieur aux non-arriérés
  SELECT MIN("allocationOrder") INTO v_min_arrear_order
  FROM payment_allocations
  WHERE "paymentId" = NEW."paymentId"
  AND "targetType" = 'ARREAR';

  SELECT MAX("allocationOrder") INTO v_max_non_arrear_order
  FROM payment_allocations
  WHERE "paymentId" = NEW."paymentId"
  AND "targetType" != 'ARREAR';

  -- Si on insère un ARREAR, vérifier qu'il n'y a pas de non-ARREAR avec ordre 1
  IF NEW."targetType" = 'ARREAR' THEN
    IF v_max_non_arrear_order IS NOT NULL AND v_max_non_arrear_order <= 1 THEN
      RAISE EXCEPTION 'Les arriérés ont priorité maximale (ordre 1). Il existe déjà des allocations non-arriérés avec ordre <= 1';
    END IF;
  END IF;

  -- Si on insère un non-ARREAR, vérifier qu'il n'y a pas d'ARREAR avec ordre > 1
  IF NEW."targetType" != 'ARREAR' AND NEW."allocationOrder" = 1 THEN
    IF v_min_arrear_order IS NOT NULL THEN
      RAISE EXCEPTION 'L''ordre 1 est réservé aux arriérés. Les non-arriérés doivent avoir ordre >= 2';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. FONCTION : Vérifier profil tarifaire élève
-- ----------------------------------------------------------------------------
-- Vérifie qu'un élève a un profil tarifaire pour une année scolaire donnée
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION check_student_fee_profile_exists(
  p_student_id TEXT,
  p_academic_year_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_profile_count
  FROM student_fee_profiles
  WHERE "studentId" = p_student_id
  AND "academicYearId" = p_academic_year_id;

  RETURN v_profile_count > 0;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 3. FONCTION : Empêcher suppression paiement
-- ----------------------------------------------------------------------------
-- Vérifie qu'un paiement ne peut pas être supprimé s'il a des allocations
-- ou un reçu associé
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION prevent_payment_deletion()
RETURNS TRIGGER AS $$
DECLARE
  v_allocation_count INTEGER;
  v_receipt_count INTEGER;
BEGIN
  -- Vérifier si le paiement a des allocations
  SELECT COUNT(*) INTO v_allocation_count
  FROM payment_allocations
  WHERE "paymentId" = OLD.id;

  -- Vérifier si le paiement a un reçu
  SELECT COUNT(*) INTO v_receipt_count
  FROM payment_receipts
  WHERE "paymentId" = OLD.id;

  -- Empêcher suppression si allocations ou reçu existent
  IF v_allocation_count > 0 THEN
    RAISE EXCEPTION 'Impossible de supprimer le paiement. Il a % allocation(s) associée(s). Utilisez une annulation (soft delete) ou supprimez d''abord les allocations.', v_allocation_count;
  END IF;

  IF v_receipt_count > 0 THEN
    RAISE EXCEPTION 'Impossible de supprimer le paiement. Il a un reçu associé. Les paiements avec reçu ne peuvent pas être supprimés.';
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 4. FONCTION : Vérifier profil tarifaire lors création StudentFee
-- ----------------------------------------------------------------------------
-- Vérifie qu'un StudentFee ne peut être créé que si le Student a un profil
-- tarifaire pour l'année scolaire
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION ensure_student_fee_profile_before_fee()
RETURNS TRIGGER AS $$
DECLARE
  v_has_profile BOOLEAN;
BEGIN
  -- Vérifier que le Student a un profil tarifaire pour cette année
  SELECT check_student_fee_profile_exists(NEW."studentId", NEW."academicYearId")
  INTO v_has_profile;

  IF NOT v_has_profile THEN
    RAISE EXCEPTION 'Impossible de créer un StudentFee sans profil tarifaire. L''élève % doit avoir un StudentFeeProfile pour l''année scolaire % avant de créer des frais.', NEW."studentId", NEW."academicYearId";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- NOTES IMPORTANTES
-- ----------------------------------------------------------------------------
-- 
-- Ces fonctions sont utilisées par les triggers dans triggers.sql
-- 
-- ============================================================================
