from typing import Dict, Any, List

class CancellationRiskAnalyzer:
    def __init__(self):
        pass

    def evaluate_driver_cancellation_risk(
        self,
        pickup_distance_km: float,
        driver_historical_cancellation_rate: float,
        time_to_pickup_min: float,
        is_cash_trip: bool = False,
        recent_cancellations_count_today: int = 0
    ) -> Dict[str, Any]:
        """
        Calculates cancellation risk probability (0.0 to 1.0)
        Used strictly as decision-support for dispatch and auto-recovery readiness.
        """
        risk_score = 0.05 # Baseline

        # Pickup distance impact
        if pickup_distance_km > 7.0:
            risk_score += 0.25
        elif pickup_distance_km > 4.0:
            risk_score += 0.12

        # Driver cancellation history
        if driver_historical_cancellation_rate > 0.20:
            risk_score += 0.30
        elif driver_historical_cancellation_rate > 0.10:
            risk_score += 0.15

        # Repeated recent cancellations
        if recent_cancellations_count_today >= 2:
            risk_score += 0.20

        # Cash trip slight variability
        if is_cash_trip:
            risk_score += 0.05

        capped_risk = min(0.95, round(risk_score, 2))
        risk_level = "HIGH" if capped_risk > 0.50 else ("MEDIUM" if capped_risk > 0.25 else "LOW")

        return {
            "cancellation_probability": capped_risk,
            "risk_level": risk_level,
            "auto_recovery_standby_recommended": capped_risk > 0.45,
            "contributing_factors": {
                "pickup_distance_impact": pickup_distance_km > 4.0,
                "driver_history_impact": driver_historical_cancellation_rate > 0.10,
                "recent_pattern_impact": recent_cancellations_count_today >= 2
            }
        }

    def detect_suspicious_cancellation_abuse(
        self,
        driver_id: str,
        recent_events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Pattern detection:
        Driver accepts -> calls/messages passenger -> cancels with reasons like 'passenger didn't show'
        or passenger reports fare extortion.
        """
        suspicious_score = 0.0
        signals = []

        cancel_after_contact_count = sum(
            1 for e in recent_events if e.get("type") == "CANCEL_AFTER_PASSENGER_CONTACT"
        )
        fare_demands_reported = sum(
            1 for e in recent_events if e.get("type") == "PASSENGER_REPORTED_EXTRA_MONEY"
        )
        quick_cancels = sum(
            1 for e in recent_events if e.get("type") == "CANCEL_WITHIN_2_MINS_OF_ACCEPT"
        )

        if fare_demands_reported > 0:
            suspicious_score += 0.50 * fare_demands_reported
            signals.append(f"{fare_demands_reported} passenger report(s) of extra fare demanded")

        if cancel_after_contact_count >= 2:
            suspicious_score += 0.35
            signals.append(f"{cancel_after_contact_count} cancellations immediately following passenger contact")

        if quick_cancels >= 3:
            suspicious_score += 0.25
            signals.append(f"{quick_cancels} repetitive quick accepts and immediate cancellations")

        flagged = suspicious_score >= 0.50

        return {
            "driver_id": driver_id,
            "flagged_for_review": flagged,
            "abuse_suspicion_score": min(1.0, round(suspicious_score, 2)),
            "recommended_action": "OPERATIONS_REVIEW" if flagged else "MONITOR",
            "signals": signals,
            "action_guidance": "Human review required. Do not automatically penalize without audit."
        }
