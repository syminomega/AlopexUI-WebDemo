/* tslint:disable */
/* eslint-disable */

export class VelloWebRenderer {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    direct_begin_element(element_id: bigint): void;
    direct_begin_frame(): void;
    direct_begin_frame_graph(frame_id: bigint): void;
    direct_create_path(): number;
    direct_draw_circle(cx: number, cy: number, radius: number, style: number, stroke_width: number, stroke_cap: number, stroke_join: number, r: number, g: number, b: number, a: number, m11: number, m12: number, m21: number, m22: number, m31: number, m32: number): void;
    direct_draw_element(element_id: bigint, m11: number, m12: number, m21: number, m22: number, m31: number, m32: number): void;
    direct_draw_frame_graph(frame_id: bigint, m11: number, m12: number, m21: number, m22: number, m31: number, m32: number): void;
    direct_draw_line(x1: number, y1: number, x2: number, y2: number, stroke_width: number, stroke_cap: number, stroke_join: number, r: number, g: number, b: number, a: number, m11: number, m12: number, m21: number, m22: number, m31: number, m32: number): void;
    direct_draw_oval(x: number, y: number, width: number, height: number, style: number, stroke_width: number, stroke_cap: number, stroke_join: number, r: number, g: number, b: number, a: number, m11: number, m12: number, m21: number, m22: number, m31: number, m32: number): void;
    direct_draw_path(path_id: number, style: number, stroke_width: number, stroke_cap: number, stroke_join: number, r: number, g: number, b: number, a: number, m11: number, m12: number, m21: number, m22: number, m31: number, m32: number): void;
    direct_draw_rect(x: number, y: number, width: number, height: number, style: number, stroke_width: number, stroke_cap: number, stroke_join: number, r: number, g: number, b: number, a: number, m11: number, m12: number, m21: number, m22: number, m31: number, m32: number): void;
    direct_draw_round_rect(x: number, y: number, width: number, height: number, top_left_radius: number, top_right_radius: number, bottom_right_radius: number, bottom_left_radius: number, style: number, stroke_width: number, stroke_cap: number, stroke_join: number, r: number, g: number, b: number, a: number, m11: number, m12: number, m21: number, m22: number, m31: number, m32: number): void;
    direct_draw_shape_with_brush(shape: number, x0: number, y0: number, x1: number, y1: number, r0: number, r1: number, r2: number, r3: number, style: number, stroke_width: number, stroke_cap: number, stroke_join: number, brush_kind: number, r: number, g: number, b: number, a: number, p0x: number, p0y: number, p1x: number, p1y: number, radius: number, start_angle: number, end_angle: number, spread: number, stop_offsets: Uint8Array, stop_colors: Uint8Array, image_id: bigint, tile_mode: number, stretch: number, align_x: number, align_y: number, has_bounds: boolean, bounds_x: number, bounds_y: number, bounds_width: number, bounds_height: number, m11: number, m12: number, m21: number, m22: number, m31: number, m32: number): void;
    direct_draw_text(text: string, x: number, y: number, align: number, family_name: string, size: number, r: number, g: number, b: number, a: number, m11: number, m12: number, m21: number, m22: number, m31: number, m32: number): void;
    direct_draw_text_with_brush(text: string, x: number, y: number, align: number, family_name: string, size: number, brush_kind: number, r: number, g: number, b: number, a: number, p0x: number, p0y: number, p1x: number, p1y: number, radius: number, start_angle: number, end_angle: number, spread: number, stop_offsets: Uint8Array, stop_colors: Uint8Array, image_id: bigint, tile_mode: number, stretch: number, align_x: number, align_y: number, has_bounds: boolean, bounds_x: number, bounds_y: number, bounds_width: number, bounds_height: number, m11: number, m12: number, m21: number, m22: number, m31: number, m32: number): void;
    direct_drop_element(element_id: bigint): void;
    direct_drop_frame_graph(frame_id: bigint): void;
    direct_drop_path(path_id: number): void;
    direct_end_element(): void;
    direct_end_frame_graph(): void;
    direct_path_arc_to(path_id: number, x1: number, y1: number, x2: number, y2: number, radius: number): void;
    direct_path_close(path_id: number): void;
    direct_path_cubic_to(path_id: number, x: number, y: number, cx: number, cy: number, tx: number, ty: number): void;
    direct_path_line_to(path_id: number, x: number, y: number): void;
    direct_path_move_to(path_id: number, x: number, y: number): void;
    direct_path_quad_to(path_id: number, cx: number, cy: number, x: number, y: number): void;
    direct_pop_layer(): void;
    direct_push_clip_path(path_id: number, m11: number, m12: number, m21: number, m22: number, m31: number, m32: number): void;
    direct_push_clip_rect(x: number, y: number, width: number, height: number, m11: number, m12: number, m21: number, m22: number, m31: number, m32: number): void;
    direct_render(background_r: number, background_g: number, background_b: number, background_a: number): void;
    dispose(): void;
    measure_text(family_name: string, text: string, size: number): number;
    register_font(family_name: string, font_bytes: Uint8Array): void;
    register_image(image_id: bigint, image_bytes: Uint8Array): void;
    resize(width: number, height: number): Promise<void>;
}

export function create_renderer(canvas: HTMLCanvasElement, width: number, height: number): Promise<VelloWebRenderer>;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_vellowebrenderer_free: (a: number, b: number) => void;
    readonly create_renderer: (a: any, b: number, c: number) => any;
    readonly vellowebrenderer_direct_begin_element: (a: number, b: bigint) => [number, number];
    readonly vellowebrenderer_direct_begin_frame: (a: number) => void;
    readonly vellowebrenderer_direct_begin_frame_graph: (a: number, b: bigint) => [number, number];
    readonly vellowebrenderer_direct_draw_element: (a: number, b: bigint, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly vellowebrenderer_direct_draw_frame_graph: (a: number, b: bigint, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly vellowebrenderer_direct_drop_element: (a: number, b: bigint) => void;
    readonly vellowebrenderer_direct_drop_frame_graph: (a: number, b: bigint) => void;
    readonly vellowebrenderer_direct_end_element: (a: number) => [number, number];
    readonly vellowebrenderer_direct_end_frame_graph: (a: number) => [number, number];
    readonly vellowebrenderer_direct_render: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly vellowebrenderer_dispose: (a: number) => void;
    readonly vellowebrenderer_resize: (a: number, b: number, c: number) => any;
    readonly vellowebrenderer_direct_create_path: (a: number) => number;
    readonly vellowebrenderer_direct_drop_path: (a: number, b: number) => void;
    readonly vellowebrenderer_direct_path_arc_to: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly vellowebrenderer_direct_path_close: (a: number, b: number) => [number, number];
    readonly vellowebrenderer_direct_path_cubic_to: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly vellowebrenderer_direct_path_line_to: (a: number, b: number, c: number, d: number) => [number, number];
    readonly vellowebrenderer_direct_path_move_to: (a: number, b: number, c: number, d: number) => [number, number];
    readonly vellowebrenderer_direct_path_quad_to: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly vellowebrenderer_measure_text: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly vellowebrenderer_register_font: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly vellowebrenderer_register_image: (a: number, b: bigint, c: number, d: number) => [number, number];
    readonly vellowebrenderer_direct_draw_circle: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number) => [number, number];
    readonly vellowebrenderer_direct_draw_line: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number) => [number, number];
    readonly vellowebrenderer_direct_draw_oval: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number, s: number) => [number, number];
    readonly vellowebrenderer_direct_draw_path: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number) => [number, number];
    readonly vellowebrenderer_direct_draw_rect: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number, s: number) => [number, number];
    readonly vellowebrenderer_direct_draw_round_rect: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number, s: number, t: number, u: number, v: number, w: number) => [number, number];
    readonly vellowebrenderer_direct_draw_shape_with_brush: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number, s: number, t: number, u: number, v: number, w: number, x: number, y: number, z: number, a1: number, b1: number, c1: number, d1: number, e1: number, f1: bigint, g1: number, h1: number, i1: number, j1: number, k1: number, l1: number, m1: number, n1: number, o1: number, p1: number, q1: number, r1: number, s1: number, t1: number, u1: number) => [number, number];
    readonly vellowebrenderer_direct_draw_text: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number, s: number) => [number, number];
    readonly vellowebrenderer_direct_draw_text_with_brush: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number, s: number, t: number, u: number, v: number, w: number, x: number, y: number, z: number, a1: bigint, b1: number, c1: number, d1: number, e1: number, f1: number, g1: number, h1: number, i1: number, j1: number, k1: number, l1: number, m1: number, n1: number, o1: number, p1: number) => [number, number];
    readonly vellowebrenderer_direct_pop_layer: (a: number) => void;
    readonly vellowebrenderer_direct_push_clip_path: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly vellowebrenderer_direct_push_clip_rect: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h3a85595bf19719e3: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen__convert__closures_____invoke__h20eab749ca0d0887: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h1346193d6ab1d1d4: (a: number, b: number, c: any) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_destroy_closure: (a: number, b: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
