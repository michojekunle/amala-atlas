from rest_framework import serializers

from . import models
from .models import Submission


class SpotSerializer(serializers.ModelSerializer):
    class Meta:
        models = models.Spot
        fields = ('id', 'public_id', 'created_at', 'last_modified_at', 'name', 'address', 'city', 'state', 'lat', 'lng')

class GetSpotSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Spot
        fields = (
            'id', 'public_id', 'created_at', 'last_modified_at', 'name', 'address', 'city', 'state', 'lat', 'lng', 'country',
            'zipcode', 'price_band', 'tags', 'photos', 'open_hours', 'source'
        )

class CandidateSubmissionSerializer(serializers.Serializer):
    kind = serializers.ChoiceField(choices=Submission.Kind.choices, default=Submission.Kind.MANUAL)

    class Meta:
        model = Submission
        fields = (
            'id', 'public_id', 'created_at', 'last_modified_at', "kind", "name", "address", "city", "country", "lat", "lng", "price_band",
            "tags", "hours_text", "email", "photo_url", "transcript", "raw_payload"
        )

    def validate(self, attrs):
        lat, lng = attrs['lat'], attrs['lng']
        if (lat is not None) ^ (lng is not None):
            raise serializers.ValidationError("Provide both lat and lng together, or leave both empty.")
        return attrs