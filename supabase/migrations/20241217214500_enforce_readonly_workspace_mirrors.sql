-- Make mirrored subscription fields on workspaces effectively read-only (reset to subscription values on update)
BEGIN;

CREATE OR REPLACE FUNCTION public.enforce_workspace_mirror_readonly()
RETURNS trigger AS $$
DECLARE
  sub_rec RECORD;
BEGIN
  -- Only act if mirrored fields are being changed
  IF NEW.plan_slug IS DISTINCT FROM OLD.plan_slug
     OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.effective_bundle_limit IS DISTINCT FROM OLD.effective_bundle_limit
     OR NEW.effective_conversations_limit IS DISTINCT FROM OLD.effective_conversations_limit
     OR NEW.effective_messages_limit IS DISTINCT FROM OLD.effective_messages_limit
     OR NEW.next_usage_reset_date IS DISTINCT FROM OLD.next_usage_reset_date
     OR NEW.next_billing_date IS DISTINCT FROM OLD.next_billing_date THEN

    SELECT
      s.plan_slug,
      s.status,
      s.effective_bundle_limit,
      s.effective_conversations_limit,
      s.effective_messages_limit,
      s.next_usage_reset_date,
      s.next_billing_date
    INTO sub_rec
    FROM public.subscriptions s
    WHERE s.workspace_slug = NEW.slug
    LIMIT 1;

    IF FOUND THEN
      NEW.plan_slug := sub_rec.plan_slug;
      NEW.subscription_status := sub_rec.status;
      NEW.effective_bundle_limit := sub_rec.effective_bundle_limit;
      NEW.effective_conversations_limit := sub_rec.effective_conversations_limit;
      NEW.effective_messages_limit := sub_rec.effective_messages_limit;
      NEW.next_usage_reset_date := sub_rec.next_usage_reset_date;
      NEW.next_billing_date := sub_rec.next_billing_date;
    ELSE
      -- No subscription found; revert to old values to avoid manual edits
      NEW.plan_slug := OLD.plan_slug;
      NEW.subscription_status := OLD.subscription_status;
      NEW.effective_bundle_limit := OLD.effective_bundle_limit;
      NEW.effective_conversations_limit := OLD.effective_conversations_limit;
      NEW.effective_messages_limit := OLD.effective_messages_limit;
      NEW.next_usage_reset_date := OLD.next_usage_reset_date;
      NEW.next_billing_date := OLD.next_billing_date;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_workspace_mirrors_readonly ON public.workspaces;
CREATE TRIGGER trg_workspace_mirrors_readonly
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_workspace_mirror_readonly();

COMMIT;
