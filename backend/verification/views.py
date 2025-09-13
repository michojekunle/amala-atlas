import logging

from django.db import transaction
from rest_framework import generics, status
from rest_framework.generics import ListAPIView, RetrieveAPIView, get_object_or_404
from rest_framework.response import Response

from places.models import Candidate, Spot
from verification.models import Verification
from verification.serializers import VerificationSerializer, CandidateQueueSerializer, VerificationActionSerializer

APPROVE_THRESHOLD = 2
REJECT_THRESHOLD  = 3

logger = logging.getLogger(__name__)


"""
List candidates pending verification, highest score first.
"""
class GetVerificationCandidateQueue(ListAPIView):

    serializer_class = CandidateQueueSerializer

    def get_queryset(self):
        query_set = Candidate.objects.filter(status="pending_verification").order_by('-score', '-created_at')
        city = self.request.query_params.get('city', None)
        src = self.request.query_params.get('source_kind', None)
        if city: query_set = query_set.filter(city__iexact=city)
        if src: query_set = query_set.filter(source_kind__iexact=src)
        return query_set


"""

"""
class GetVerificationCandidate(RetrieveAPIView):
    queryset = Verification.objects.all()
    serializer_class = VerificationSerializer
    filterset_fields = ['city', 'source_kind']


"""

"""
class VerificationActionView(generics.CreateAPIView):
    serializer_class = VerificationActionSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        logger.info(f"Validated data from serializer: {serializer.validated_data}")
        candidate_id = serializer.validated_data['candidate_id']
        action = serializer.validated_data['action']
        notes = serializer.validated_data.get("notes", "")

        candidate: Candidate = get_object_or_404(Candidate.objects.select_for_update(), pk=candidate_id)

        user = getattr(request, "user", None)
        if user and not getattr(user, "is_authenticated", False):
            user = None

        existing_q = candidate.verifications
        if user:
            existing_q = existing_q.filter(by_user=user)
        else:
            existing_q = existing_q.filter(by_user__isnull=True)

        value = existing_q.first()
        if value:
            value.action = action
            value.notes = notes
            value.save(update_fields=["action", "notes"])
        else:
            Verification.objects.create(candidate=candidate, action=action, notes=notes, by_user=user)

        Verification.objects.create(candidate=candidate, action=action, notes=notes)

        approvals = candidate.verifications.filter(action=Verification.Actions.APPROVE).count()
        rejects = candidate.verifications.filter(action=Verification.Actions.REJECT).count()

        if action == Verification.Actions.APPROVE:
            if approvals >= APPROVE_THRESHOLD and candidate.status != "approved":
                Spot.objects.create(
                    name=candidate.name, lat=candidate.lat or 0.0, lng=candidate.lng or 0.0,
                    address=candidate.raw_address or "", city=candidate.city, country=candidate.country,
                    price_band=candidate.price_band or "", tags=[],
                    photos=[{"url": candidate.photo_url}] if candidate.photo_url else [],
                    open_hours=candidate.open_hours, source="verified",
                )
                candidate.status = "approved"
                candidate.save(update_fields=["status"])
                return Response({"ok": True}, status=status.HTTP_201_CREATED, )

        if action == Verification.Actions.REJECT:
            if rejects >= REJECT_THRESHOLD and candidate.status != "rejected":
                candidate.status = "rejected"
                candidate.save(update_fields=["status"])
            return Response({"ok": True, "rejections": rejects, "message": "Candidate Rejected"}, status=status.HTTP_200_OK)

        return Response({"error": "unknown action"}, status=400)

