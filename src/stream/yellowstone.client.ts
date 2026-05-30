import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { grpcConfig } from "../config/grpc";

const PROTO_PATH = path.join(__dirname, "proto", "geyser.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.join(__dirname, "proto")],
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const GeyserService = protoDescriptor.geyser?.Geyser;

// Separate client for slot watching
let slotClientInstance: any = null;

// Always create fresh client for confirmation streams
export const getYellowstoneClient = (): any => {
  if (!slotClientInstance) {
    const credentials = grpc.credentials.createSsl();
    slotClientInstance = new GeyserService(
      grpcConfig.url,
      credentials
    );
    slotClientInstance._metadata = new grpc.Metadata();
    slotClientInstance._metadata.add("x-token", grpcConfig.token);
  }
  return slotClientInstance;
};

// Always create a fresh client for each confirmation stream
export const createFreshClient = (): any => {
  const credentials = grpc.credentials.createSsl();
  const client = new GeyserService(
    grpcConfig.url,
    credentials
  );
  client._metadata = new grpc.Metadata();
  client._metadata.add("x-token", grpcConfig.token);
  return client;
};

export const resetClient = (): void => {
  if (slotClientInstance) {
    slotClientInstance.close();
    slotClientInstance = null;
  }
};

export const createSubscribeStream = (): any => {
  const client = getYellowstoneClient();
  const stream = client.Subscribe(client._metadata);
  return stream;
};

export const createConfirmationStream = (): any => {
  const client = createFreshClient();
  const stream = client.Subscribe(client._metadata);
  return stream;
};
