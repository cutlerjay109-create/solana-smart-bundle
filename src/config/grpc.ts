import { config } from './index';

export const grpcConfig = {
  url: config.grpc.url,
  token: config.grpc.token,
  options: {
    'grpc.max_receive_message_length': 1024 * 1024 * 64,
    'grpc.max_send_message_length': 1024 * 1024 * 64,
    'grpc.keepalive_time_ms': 10000,
    'grpc.keepalive_timeout_ms': 5000,
    'grpc.keepalive_permit_without_calls': 1,
  },
};
