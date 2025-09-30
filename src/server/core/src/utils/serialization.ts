// Utility function để handle BigInt serialization
export function serializeBigIntObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigIntObject);
  }

  if (typeof obj === "object") {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigIntObject(value);
    }
    return serialized;
  }

  return obj;
}

// Alternative simple approach for profile objects specifically
export function serializeProfile(profile: any): any {
  if (!profile) return null;

  return {
    ...profile,
    id: profile.id?.toString(),
    user_id: profile.user_id?.toString(),
  };
}
