from typing import Dict, Any, List

class FraudDetector:
    def __init__(self):
        pass

    def evaluate_transaction_or_activity(
        self,
        user_id: str,
        category: str,
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Evaluates fraud risk for referrals, coupons, GPS movements, and payments.
        Outputs: NORMAL, REVIEW, HIGH_RISK.
        """
        category_upper = category.upper()
        risk_score = 0.0
        reasons = []

        if category_upper == "REFERRAL_ABUSE":
            device_id = metadata.get("device_id")
            ip_address = metadata.get("ip_address")
            accounts_on_device = metadata.get("accounts_on_device", 1)
            completed_rides = metadata.get("completed_rides", 0)

            if accounts_on_device > 3:
                risk_score += 0.65
                reasons.append(f"{accounts_on_device} accounts detected from the exact same device ID")
            elif accounts_on_device > 1:
                risk_score += 0.30
                reasons.append("Multiple accounts sharing device hardware fingerprint")

            if completed_rides == 0:
                risk_score += 0.20
                reasons.append("Referee has not completed mandatory qualifying ride")

        elif category_upper == "GPS_ANOMALY":
            jump_distance_meters = metadata.get("jump_distance_meters", 0)
            time_difference_seconds = max(1, metadata.get("time_difference_seconds", 1))
            speed_kmph = (jump_distance_meters / time_difference_seconds) * 3.6

            if speed_kmph > 180:
                risk_score += 0.85
                reasons.append(f"Physical impossibility: GPS teleportation of {round(speed_kmph, 1)} km/h detected")
            elif speed_kmph > 120:
                risk_score += 0.40
                reasons.append("Unusual GPS velocity spike")

            if metadata.get("is_mock_location_app_detected", False):
                risk_score += 0.70
                reasons.append("Mock GPS provider/location spoofer detected on device")

        elif category_upper == "PAYMENT_ANOMALY":
            card_attempts = metadata.get("failed_attempts_last_hour", 0)
            chargeback_history = metadata.get("prior_chargebacks", 0)

            if card_attempts >= 4:
                risk_score += 0.60
                reasons.append(f"{card_attempts} payment failures within 1 hour")
            if chargeback_history > 0:
                risk_score += 0.40
                reasons.append("Prior chargeback record found")

        elif category_upper == "COUPON_ABUSE":
            coupon_usage_count = metadata.get("coupon_usage_count_same_payment_method", 1)
            if coupon_usage_count > 2:
                risk_score += 0.55
                reasons.append(f"Promo applied across {coupon_usage_count} profiles with identical payment source")

        capped_score = min(1.0, round(risk_score, 2))
        if capped_score >= 0.70:
            level = "HIGH_RISK"
            recommended_action = "REQUIRE_IDENTITY_VERIFICATION"
        elif capped_score >= 0.35:
            level = "REVIEW"
            recommended_action = "FLAG_FOR_OPERATIONS_AUDIT"
        else:
            level = "NORMAL"
            recommended_action = "ALLOW"

        return {
            "user_id": user_id,
            "category": category_upper,
            "risk_score": capped_score,
            "risk_level": level,
            "recommended_action": recommended_action,
            "reasons": reasons,
            "requires_human_review": level in ["REVIEW", "HIGH_RISK"],
            "guideline": "Adhere to safety protocol: never terminate account automatically without human sign-off."
        }
