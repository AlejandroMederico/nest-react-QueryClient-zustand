export default interface CreateContentRequest {
  name: string;
  description: string;
  image?: File | null;
}
