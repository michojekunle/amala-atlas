from json import JSONDecodeError

from django.http import JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import views, status, viewsets, pagination, generics
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED

from places import services
from places.filters import GetSpotsFilter
from places.models import Spot, Submission, Candidate
from places.serializers import SpotSerializer, GetSpotSerializer, CandidateSubmissionSerializer


class SpotApiView(views.APIView):
    serializer_class = SpotSerializer

    def get_serializer(self, *args, **kwargs):
        kwargs['context'] = self.get_serializer_context()
        return self.serializer_class(*args, **kwargs)

    def get_serializer_context(self):
        yield {
            'request': self.request,
            'format': self.format_kwarg,
            'view': self,
        }

    def post(self, request):
        try:
            data = JSONParser().parse(request)
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except JSONDecodeError | Exception:
            return JsonResponse({"result": "error","message": "Json decoding error"}, status=status.HTTP_400_BAD_REQUEST)


class SpotPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 10


"""

"""
class SpotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Spot.objects.all().order_by("-created_at")
    serializer_class = GetSpotSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = GetSpotsFilter
    pagination_class = None


"""
Accepts both manual and agentic submissions.
- Saves a Submission row (audit)
- Creates a Candidate with status=pending_verification
"""
class CandidateSubmissionView(generics.CreateAPIView):

    serializer_class = CandidateSubmissionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        submission: Submission = serializer.save(submitted_by=request.user if getattr(request, 'user', None) and request.user.is_authenticated else None)
        candidate: Candidate = services.create_candidate_from_submission(submission)

        return Response(
            {
                "ok": True, "candidate_id": candidate.public_id,
                "status": candidate.status, "score":candidate.score
            }, status=HTTP_201_CREATED)
