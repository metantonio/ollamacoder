export interface ApiResponse<T> {
  code: number;
  data: T;
  info: string;
}

export class ResponseUtil {
  static success<T>(data: T, info: string = 'success'): ApiResponse<T> {
    return {
      code: 0,
      data,
      info,
    };
  }

  static error(info: string, code: number = -1): ApiResponse<null> {
    return {
      code,
      data: null,
      info,
    };
  }
}

export async function appResponse<T>(
  handler: () => Promise<T>
): Promise<Response> {
  try {
    const data = await handler();
    return new Response(
      JSON.stringify(ResponseUtil.success(data)),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'enknow error';
    return new Response(
      JSON.stringify(ResponseUtil.error(errorMessage)),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}