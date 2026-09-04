'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface ParcelMapProps {
  geometry: any | null;
  ulpin: string;
  className?: string;
}

export function ParcelMap({ geometry, ulpin, className = '' }: ParcelMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Check if geometry is valid GeoJSON Polygon/MultiPolygon
  const hasValidGeometry =
    geometry &&
    typeof geometry === 'object' &&
    (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') &&
    Array.isArray(geometry.coordinates) &&
    geometry.coordinates.length > 0;

  useEffect(() => {
    if (!hasValidGeometry || !mapContainer.current) return;

    try {
      // Basic OSM tile style for clean, reliable rendering
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap contributors',
            },
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [75.78, 26.91], // Default Jaipur approx center
        zoom: 14,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

      map.on('load', () => {
        try {
          // Add GeoJSON parcel source
          map.addSource('parcel-boundary', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: { ulpin },
              geometry: geometry,
            },
          });

          // Add Fill Layer
          map.addLayer({
            id: 'parcel-fill',
            type: 'fill',
            source: 'parcel-boundary',
            paint: {
              'fill-color': '#059669', // Emerald
              'fill-opacity': 0.25,
            },
          });

          // Add Outline Layer
          map.addLayer({
            id: 'parcel-line',
            type: 'line',
            source: 'parcel-boundary',
            paint: {
              'line-color': '#047857', // Darker emerald
              'line-width': 3,
            },
          });

          // Compute Bounding Box to fit map viewport to parcel
          const bounds = new maplibregl.LngLatBounds();
          const coords: [number, number][] =
            geometry.type === 'Polygon'
              ? geometry.coordinates[0]
              : geometry.coordinates.flat(1);

          coords.forEach(([lng, lat]: [number, number]) => {
            if (typeof lng === 'number' && typeof lat === 'number') {
              bounds.extend([lng, lat]);
            }
          });

          if (!bounds.isEmpty()) {
            map.fitBounds(bounds, {
              padding: { top: 50, bottom: 50, left: 50, right: 50 },
              maxZoom: 16,
              duration: 800,
            });
          }
        } catch (layerErr: any) {
          console.error('Error rendering parcel layer:', layerErr);
          setMapError('Failed to render parcel spatial layer.');
        }
      });

      mapInstance.current = map;

      return () => {
        map.remove();
        mapInstance.current = null;
      };
    } catch (err: any) {
      console.error('Error initializing map:', err);
      setMapError('Map initialization failed.');
    }
  }, [geometry, hasValidGeometry, ulpin]);

  // Geometry Unavailable Fallback
  if (!hasValidGeometry) {
    return (
      <div
        className={`w-full h-72 sm:h-80 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center p-6 text-slate-500 ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h4 className="text-sm font-bold text-slate-700">Parcel geometry unavailable</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          No GIS polygon coordinates recorded for {ulpin} in survey/cadastral records.
        </p>
      </div>
    );
  }

  // Map Error State
  if (mapError) {
    return (
      <div
        className={`w-full h-72 sm:h-80 rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-center p-6 text-red-700 ${className}`}
      >
        <p className="text-xs font-semibold">{mapError}</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur text-white px-2.5 py-1 rounded text-[11px] font-mono tracking-tight shadow">
        GIS Boundary: {ulpin}
      </div>
    </div>
  );
}
