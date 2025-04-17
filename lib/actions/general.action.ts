"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { createServerClient } from "@/supabase/server";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    const supabase = createServerClient();

    if (feedbackId) {
      const { error } = await supabase
        .from("feedback")
        .update(feedback)
        .eq("id", feedbackId);

      if (error) throw error;

      return { success: true, feedbackId: feedbackId };
    } else {
      const { data, error } = await supabase
        .from("feedback")
        .insert(feedback)
        .select("id")
        .single();

      if (error) throw error;

      return { success: true, feedbackId: data.id };
    }
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return data as Interview;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("interviewId", interviewId)
    .eq("userId", userId)
    .limit(1)
    .single();

  if (error || !data) return null;

  return data as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("finalized", true)
    .neq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(limit);

  if (error || !data) return null;

  return data as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error || !data) return null;

  return data as Interview[];
}
