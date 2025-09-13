from rest_framework import serializers

from places.models import Candidate
from . import models
from .models import Verification


class VerificationSerializer(serializers.ModelSerializer):
    candidate_id = serializers.CharField(source="candidate.id")
    # user_id = ModelField(model_field=User)

    class Meta:
        model = models.Verification
        fields = ('candidate', 'action', 'notes')
        read_only_fields = ("id", "public_id", "created_at")


class VerificationActionSerializer(serializers.Serializer):
    candidate_id = serializers.IntegerField()
    action = serializers.ChoiceField(choices=[x.value for x in Verification.Actions])
    notes = serializers.CharField(required=False, allow_blank=True)
    merge_into_spot_id = serializers.IntegerField(required=False)


class CandidateQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Candidate
        fields = ("id","name","city","score","source_kind","evidence","signals","lat","lng","raw_address")
