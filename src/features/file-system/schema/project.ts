import { z } from "zod";

export const ProjectSchema = z.object({
	version: z.string(),
	timestamp: z.number(),
	nodes: z.array(z.any()),
	edges: z.array(z.any()),
});

export type ProjectData = z.infer<typeof ProjectSchema>;
