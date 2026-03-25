declare namespace kakao {
  namespace maps {
    function load(callback: () => void): void;

    class LatLng {
      constructor(lat: number, lng: number);
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setBounds(bounds: LatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number): void;
      setLevel(level: number): void;
    }

    interface MapOptions {
      center: LatLng;
      level?: number;
    }

    class LatLngBounds {
      constructor();
      extend(latlng: LatLng): void;
    }

    class MarkerImage {
      constructor(src: string, size: Size);
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      setImage(image: MarkerImage): void;
    }

    interface MarkerOptions {
      position: LatLng;
      title?: string;
      image?: MarkerImage;
    }

    class InfoWindow {
      constructor(options: InfoWindowOptions);
      open(map: Map, marker: Marker): void;
      close(): void;
    }

    interface InfoWindowOptions {
      content: string;
      removable?: boolean;
    }

    namespace event {
      function addListener(target: Marker | Map, type: string, handler: () => void): void;
    }
  }
}
