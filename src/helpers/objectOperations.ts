export function toggleField(obj: any, field: string) {
  return { ...obj, [field]: !obj[field] }
}
