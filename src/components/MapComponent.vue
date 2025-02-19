<script setup lang="ts">
import { transform } from "ol/proj";
import { type PropType, computed, provide } from "vue";
import {
  Geometries,
  Layers,
  Map,
  Sources,
  Styles,
  type Vue3OpenlayersGlobalOptions,
} from "vue3-openlayers";

// Define type for markers
export type Marker = {
  latitude: number;
  longitude: number;
  markerName?: string;
};

export type LineString = {
  minutes: number;
  meters: number;
  coordinates: [number, number][];
};

const props = defineProps({
  markers: {
    type: Array as PropType<Marker[]>,
    required: true,
  },
  lineStrings: {
    type: Array as PropType<LineString[]>,
    default: () => [],
  },
  showOpenInGoogleMaps: {
    type: Boolean,
    default: true,
  },
});

const transformedMarkerCoords = computed(() => {
  return props.markers.map((marker) => {
    return {
      markerName: marker.markerName,
      coordinates: transform(
        [marker.longitude, marker.latitude],
        "EPSG:4326",
        "EPSG:3857"
      ),
    };
  });
});

const transformedLines = computed(() => {
  return props.lineStrings.map((lineString) => {
    if (!lineString?.coordinates) {
      return;
    }
    return {
      coordinates: lineString.coordinates.map((coord) =>
        transform(coord, "EPSG:4326", "EPSG:3857")
      ),
      minutes: lineString.minutes,
      km: Math.round(lineString.meters / 1000),
    };
  });
});

const googleMapsUrl = computed(() => {
  //   For each marker, add a point in the map
  const markersString = props.markers
    .map((marker) => `${marker.latitude},${marker.longitude}`)
    .join("/");
  return `https://www.google.com/maps/dir/${markersString}`;
});

const options: Vue3OpenlayersGlobalOptions = {
  debug: false,
};

provide("ol-options", options);
</script>

<template>
  <Map.OlMap style="height: 400px">
    <Map.OlView
      :center="transformedMarkerCoords[0].coordinates"
      :zoom="15"
      projection="EPSG:3857"
    />
    <Layers.OlTileLayer>
      <Sources.OlSourceOsm />
    </Layers.OlTileLayer>

    <Layers.OlVectorLayer>
      <Sources.OlSourceVector>
        <template
          v-for="feature in transformedMarkerCoords"
          :key="feature.markerName"
        >
          <Map.OlFeature>
            <Geometries.OlGeomPoint :coordinates="feature.coordinates" />
            <Styles.OlStyle>
              <Styles.OlStyleText
                v-if="feature.markerName"
                :text="feature.markerName"
                backgroundFill="#ffffff"
                :padding="[5, 5, 5, 5]"
              />
            </Styles.OlStyle>
          </Map.OlFeature>
        </template>

        <template
          v-for="lineString in transformedLines"
          :key="lineString?.coordinates"
        >
          <Map.OlFeature v-if="lineString?.coordinates">
            <Geometries.OlGeomLineString
              :coordinates="lineString.coordinates"
            />
            <Styles.OlStyle>
              <Styles.OlStyleStroke color="black" :width="3" />
              <Styles.OlStyleText
                :text="
                  lineString.minutes + ' minutes, ' + lineString.km + ' km'
                "
                backgroundFill="#ffffff"
                :padding="[5, 5, 5, 5]"
              />
            </Styles.OlStyle>
          </Map.OlFeature>
        </template>
      </Sources.OlSourceVector>
    </Layers.OlVectorLayer>
  </Map.OlMap>

  <a
    v-if="showOpenInGoogleMaps"
    :href="googleMapsUrl"
    target="_blank"
    role="button"
  >
    {{ $t("Open in Google Maps") }}
  </a>
</template>
