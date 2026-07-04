import { redirect } from "next/navigation";

/** /learn redirects to /learn/introduction */
export default function LearnIndex() {
  redirect("/learn/introduction");
}
