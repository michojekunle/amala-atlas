import django_filters
from django.db.models import Q

from places.models import Spot


class GetSpotsFilter(django_filters.FilterSet):
    bbox = django_filters.CharFilter(method='filter_bbox')
    city = django_filters.CharFilter(field_name='city', lookup_expr='iexact')
    price_band = django_filters.CharFilter(field_name='price_band', lookup_expr='iexact')
    tags = django_filters.CharFilter(method='filter_tags')
    query = django_filters.CharFilter(method='filter_query')


    def filter_bbox(self, queryset, name, value):
        print(f"Filter by bbox: {self.bbox}")
        min_lng, min_lat, max_lng, max_lat = map(float, value.split(','))
        return queryset.filter(lng__gte=min_lng, lng__lte=max_lng, lat__gte=min_lat, lat__lte=max_lat)

    def filter_tags(self, queryset, name, value):
        print(f"Filter by tags: {self.tags}")
        tags = [t.strip() for t in value.split(",") if t.strip()]
        return queryset.filter(tags__contains=tags) if tags else queryset

    def filter_query(self, queryset, name, value):
        print(f"Filter by query: {self.query}")
        v = value.strip()
        return queryset.filter(Q(name__icontains=v) | Q(city__icontains=v) | Q(address__icontains=v)) if v else queryset

    class Meta:
        model = Spot
        fields = ['bbox', 'city', 'price_band', 'tags', 'query']