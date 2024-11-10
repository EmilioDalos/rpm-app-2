"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Category, CategoryFormData, Role } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["personal", "professional"]),
  description: z.string().min(1, "Description is required"),
  vision: z.string().min(1, "Vision is required"),
  purpose: z.string().min(1, "Purpose is required"),
  roles: z.array(z.object({
    name: z.string().min(1, "Role name is required"),
  })),
  threeToThrive: z.array(z.string().min(1, "Area cannot be empty")),
  resources: z.string().min(1, "Resources are required"),
  results: z.array(z.object({
    result: z.string().min(1, "Result is required"),
    date: z.string().min(1, "Date is required"),
  })),
  actionPlans: z.array(z.string().min(1, "Action plan cannot be empty")),
});

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (category: Category) => Promise<void>;
  category?: Category;
}

export function CategoryDialog({
  open,
  onOpenChange,
  onSave,
  category,
}: CategoryDialogProps) {
  const [imagePreview, setImagePreview] = useState(category?.imageBlob || "");

  const form = useForm<CategoryFormData & { roles: { name: string }[] }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || "personal",
      description: category?.description || "",
      vision: category?.vision || "",
      purpose: category?.purpose || "",
      roles: category?.roles?.map(role => ({ name: role.name })) || [],
      threeToThrive: category?.threeToThrive || [""],
      resources: category?.resources || "",
      results: category?.results?.map(result => ({ result: result, date: "" })) || [],
      actionPlans: category?.actionPlans || [""],
    },
  });

  const { fields: roleFields, append: appendRole, remove: removeRole } = useFieldArray({
    control: form.control,
    name: "roles",
  });

  const { fields: threeToThriveFields, append: appendThreeToThrive, remove: removeThreeToThrive } = useFieldArray({
    control: form.control,
    name: "threeToThrive",
  });

  const { fields: resultFields, append: appendResult, remove: removeResult } = useFieldArray({
    control: form.control,
    name: "results",
  });

  const { fields: actionPlanFields, append: appendActionPlan, remove: removeActionPlan } = useFieldArray({
    control: form.control,
    name: "actionPlans",
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        type: category.type,
        description: category.description,
        vision: category.vision,
        purpose: category.purpose,
        roles: category.roles?.map(role => ({ name: role.name })) || [],
        threeToThrive: category.threeToThrive || [""],
        resources: category.resources,
        results: category.results?.map(result => ({ result: result.result, date: result.date })) || [],
        actionPlans: category.actionPlans || [""],
      });
      setImagePreview(category.imageBlob || "");
    }
  }, [category]);

  const onSubmit = (data: CategoryFormData & { roles: { name: string }[] }) => {
    const roles: Role[] = data.roles.map((role) => ({
      id: Math.random().toString(36).substr(2, 9),
      categoryId: category?.id || Math.random().toString(36).substr(2, 9),
      name: role.name,
      purpose: "",
      description: "",
      coreQualities: [],
      identityStatement: "",
      reflection: "",
      imageBlob: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const newCategory: Category = {
      id: category?.id || Math.random().toString(36).substr(2, 9),
      name: data.name,
      type: data.type,
      description: data.description,
      vision: data.vision,
      purpose: data.purpose,
      roles,
      threeToThrive: data.threeToThrive,
      resources: data.resources,
      results: data.results.map(r => ({ result: r.result, date: r.date })),
      actionPlans: data.actionPlans,
      imageBlob: imagePreview,
      createdAt: category?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onSave(newCategory).then(() => {
      form.reset();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="sm:max-w-[425px] max-h-screen overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Create New Category"}
          </DialogTitle>
        </DialogHeader>
    
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this category..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vision</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Vision for this category..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Purpose of this category..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Roles</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendRole({ name: "" })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>
              {roleFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`roles.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Role name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRole(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Three to Thrive */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>3-To-Thrive</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendThreeToThrive("")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Focus Area
                </Button>
              </div>
              {threeToThriveFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`threeToThrive.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Focus Area" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeThreeToThrive(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Resources */}
            <FormField
              control={form.control}
              name="resources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resources</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Resources for this category..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Results */}
             <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Results</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendResult({ result: "", date: "" })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Result
                </Button>
              </div>
              {resultFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`results.${index}.result`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Result" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`results.${index}.date`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input type="date" placeholder="Date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeResult(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div> 

            {/* Action Plans */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Action Plans</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendActionPlan("")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action Plan
                </Button>
              </div>
              {actionPlanFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`actionPlans.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Action Plan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeActionPlan(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {imagePreview && (
              <img src={imagePreview} alt="Category Image" className="w-16 h-16 mb-2 rounded-full" />
            )}

            <FormField
              control={form.control}
              name="imageBlob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const result = reader.result as string;
                            field.onChange(result);
                            setImagePreview(result); // Update the preview
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
