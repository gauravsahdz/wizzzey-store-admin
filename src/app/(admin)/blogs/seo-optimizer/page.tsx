
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { analyzeBlogPostSeo, type BlogPostSeoInput, type BlogPostSeoOutput } from "@/ai/flows/blog-post-seo-optimization";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lightbulb, BarChart2, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const seoOptimizerSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  content: z.string().min(50, "Content must be at least 50 characters."),
  keywords: z.string().min(2, "Keywords are required (comma-separated)."),
});

type SeoOptimizerFormValues = z.infer<typeof seoOptimizerSchema>;

export default function SeoOptimizerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [seoResult, setSeoResult] = useState<BlogPostSeoOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<SeoOptimizerFormValues>({
    resolver: zodResolver(seoOptimizerSchema),
    defaultValues: {
      title: "",
      content: "",
      keywords: "",
    },
  });

  const onSubmit = async (values: SeoOptimizerFormValues) => {
    setIsLoading(true);
    setSeoResult(null);
    try {
      const result = await analyzeBlogPostSeo(values);
      setSeoResult(result);
      toast({ title: "Analysis Complete", description: "SEO suggestions are ready." });
    } catch (error) {
      console.error("SEO Analysis Error:", error);
      toast({ title: "Error", description: "Failed to analyze blog post. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="AI Blog Post SEO Optimizer"
        description="Analyze your blog content for SEO improvements with AI-powered suggestions."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Blog Post Details</CardTitle>
            <CardDescription>Enter your blog post information for analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blog Post Title</FormLabel>
                      <FormControl><Input placeholder="Enter blog title" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blog Post Content</FormLabel>
                      <FormControl><Textarea placeholder="Paste your blog content here..." {...field} rows={10} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Keywords</FormLabel>
                      <FormControl><Input placeholder="e.g., seo, blog optimization, ai content" {...field} /></FormControl>
                      <FormDescription>Comma-separated keywords.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Analyze SEO"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>SEO Analysis Results</CardTitle>
            <CardDescription>Suggestions and scores based on your input.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && !seoResult && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p>AI is analyzing your content...</p>
                </div>
            )}
            {!isLoading && !seoResult && (
              <p className="text-muted-foreground text-center py-10">Submit your blog post details to see SEO suggestions here.</p>
            )}
            {seoResult && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center mb-2"><BarChart2 className="mr-2 h-5 w-5 text-primary" />Keyword Density</h3>
                  <div className="flex items-center space-x-2">
                    <Progress value={(seoResult.keywordDensityScore || 0) * 100} className="w-full" />
                    <Badge variant={ (seoResult.keywordDensityScore || 0) * 100 > 70 ? "default" : (seoResult.keywordDensityScore || 0) * 100 > 40 ? "secondary" : "destructive"}>
                        {((seoResult.keywordDensityScore || 0) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                   <p className="text-sm text-muted-foreground mt-1">{seoResult.seoSuggestions}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold flex items-center mb-2"><FileText className="mr-2 h-5 w-5 text-primary" />Meta Description</h3>
                  <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{seoResult.metaDescriptionSuggestions || "No specific suggestions."}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold flex items-center mb-2"><Lightbulb className="mr-2 h-5 w-5 text-primary" />Readability</h3>
                  <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{seoResult.readabilitySuggestions || "No specific suggestions."}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold flex items-center mb-2">
                    {seoResult.toolSuggestion ? <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" /> : <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />}
                    Tool Potential
                  </h3>
                  <p className="text-sm">
                    {seoResult.toolSuggestion 
                      ? "This blog post has potential to be a tool with more information." 
                      : "Consider adding more information if you want this post to function as a tool."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
