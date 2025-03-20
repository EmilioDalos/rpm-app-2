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
import { Role } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";

// Define our own RoleFormData to match the form fields
interface RoleFormData {
  name: string;
  description: string;
  purpose: string;
  coreQualities: string[];
  identityStatement: string;
  incantations: string[];
  categoryId: string;
  imageBlob: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  purpose: z.string().min(1, "Purpose is required"),
  coreQualities: z.array(z.string().min(1, "Quality cannot be empty")),
  identityStatement: z.string().min(1, "Identity statement is required"),
  incantations: z.array(z.string().optional()).optional(),
  categoryId: z.string().optional(),
  imageBlob: z.string().optional(),
});

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (role: Role) => void;
  role?: Role;
}

export function RoleDialog({
  open,
  onOpenChange,
  onSave,
  role,
}: RoleDialogProps) {
  const [imagePreview, setImagePreview] = useState(role?.imageBlob || "");
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);

  const form = useForm<RoleFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
      purpose: role?.purpose || "",
      coreQualities: role?.coreQualities || [""],
      identityStatement: role?.identityStatement || "",
      incantations: role?.incantations || [""],
      categoryId: role?.categoryId || "",
      imageBlob: role?.imageBlob || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "coreQualities" as any,
  });

  const { fields: incantationFields, append: appendIncantation, remove: removeIncantation } = useFieldArray({
    control: form.control,
    name: "incantations" as any,
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories?simplified=true');
        if (response.ok) {
          const data = await response.json();
          if (data.categories && Array.isArray(data.categories)) {
            setCategories(data.categories);
          } else if (Array.isArray(data)) {
            setCategories(data);
          } else {
            console.error('Unexpected categories data format:', data);
            setCategories([]);
          }
        } else {
          console.error('Failed to fetch categories');
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  const onSubmit = (data: RoleFormData) => {
    // Check if at least one core quality is filled in
    const validCoreQualities = data.coreQualities.filter(q => q.trim().length > 0);
    
    if (validCoreQualities.length === 0) {
      form.setError("coreQualities", { 
        type: "manual", 
        message: "At least one core quality is required" 
      });
      return;
    }
    
    const newRole: Role = {
      id: role?.id || Date.now().toString(),
      ...data,
      coreQualities: validCoreQualities,
      incantations: data.incantations?.filter(Boolean) || [],
      createdAt: role?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(newRole);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-screen overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create New Role"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select {...field} className="block w-full">
                      <option value="">Select a category</option>
                      {Array.isArray(categories) && categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Role name" {...field} />
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
                    <Textarea placeholder="Describe this role..." {...field} />
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
                    <Textarea placeholder="Purpose of this role..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Core Qualities</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => append("")}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`coreQualities.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            placeholder={index === 0 ? "Core Quality (required)" : "Core Quality"} 
                            {...field} 
                            required={index === 0}
                            className={index === 0 ? "border-red-300 focus:border-red-500" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={index === 0 && fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {form.formState.errors.coreQualities && (
                <p className="text-sm font-medium text-destructive mt-1">
                  At least one core quality is required
                </p>
              )}
            </div>
            <FormField
              control={form.control}
              name="identityStatement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identity Statement</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Identity statement..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Incantations</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => appendIncantation("")}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
              {incantationFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`incantations.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Incantations" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIncantation(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            {imagePreview && (
              <img src={imagePreview} alt="Role Image" className="w-16 h-16 mb-2 rounded-full" />
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
                            setImagePreview(result);
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
