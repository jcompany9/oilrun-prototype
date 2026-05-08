// 카카오맵 SDK는 공식 TypeScript 타입을 제공하지 않으므로 최소한의 선언만 둠.
// SDK는 NEXT_PUBLIC_KAKAO_JS_KEY 가 있을 때 클라이언트에서 동적으로 로드된다.

interface KakaoLatLng {
  getLat(): number
  getLng(): number
}

interface KakaoMap {
  setCenter(latLng: KakaoLatLng): void
  getCenter(): KakaoLatLng
  panTo(latLng: KakaoLatLng): void
  setLevel(level: number): void
}

interface KakaoMarker {
  setMap(map: KakaoMap | null): void
  setPosition(latLng: KakaoLatLng): void
  getPosition(): KakaoLatLng
}

interface KakaoMaps {
  load(callback: () => void): void
  LatLng: new (lat: number, lng: number) => KakaoLatLng
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level?: number; draggable?: boolean }
  ) => KakaoMap
  Marker: new (options: {
    position: KakaoLatLng
    map?: KakaoMap
    draggable?: boolean
  }) => KakaoMarker
  event: {
    addListener: (
      target: KakaoMap | KakaoMarker,
      type: string,
      handler: (e?: { latLng: KakaoLatLng }) => void
    ) => void
  }
}

interface Window {
  kakao?: {
    maps: KakaoMaps
  }
}
