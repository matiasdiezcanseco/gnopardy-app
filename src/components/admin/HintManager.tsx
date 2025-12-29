"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { MediaUpload } from "./MediaUpload";
import type { QuestionHint } from "~/server/db/schema";

interface HintData {
  id?: number;
  type: "audio" | "video" | "image" | "text";
  mediaUrl?: string;
  textContent?: string;
  order: number;
  description?: string;
}

interface HintManagerProps {
  hints: HintData[];
  onChange: (hints: HintData[]) => void;
  className?: string;
}

export function HintManager({ hints, onChange, className }: HintManagerProps) {
  const [isAddingHint, setIsAddingHint] = useState(false);
  const [editingHintIndex, setEditingHintIndex] = useState<number | null>(null);

  // Form state for new/editing hint
  const [hintType, setHintType] = useState<"audio" | "video" | "image" | "text">("text");
  const [hintMediaUrl, setHintMediaUrl] = useState("");
  const [hintTextContent, setHintTextContent] = useState("");
  const [hintDescription, setHintDescription] = useState("");

  const resetHintForm = () => {
    setHintType("text");
    setHintMediaUrl("");
    setHintTextContent("");
    setHintDescription("");
    setIsAddingHint(false);
    setEditingHintIndex(null);
  };

  const handleAddHint = () => {
    if (hintType === "text" && !hintTextContent.trim()) {
      return;
    }
    if (hintType !== "text" && !hintMediaUrl.trim()) {
      return;
    }

    const newHint: HintData = {
      type: hintType,
      mediaUrl: hintType !== "text" ? hintMediaUrl : undefined,
      textContent: hintType === "text" ? hintTextContent : undefined,
      order: hints.length + 1,
      description: hintDescription || undefined,
    };

    onChange([...hints, newHint]);
    resetHintForm();
  };

  const handleUpdateHint = () => {
    if (editingHintIndex === null) return;

    if (hintType === "text" && !hintTextContent.trim()) {
      return;
    }
    if (hintType !== "text" && !hintMediaUrl.trim()) {
      return;
    }

    const updatedHints = [...hints];
    updatedHints[editingHintIndex] = {
      ...updatedHints[editingHintIndex]!,
      type: hintType,
      mediaUrl: hintType !== "text" ? hintMediaUrl : undefined,
      textContent: hintType === "text" ? hintTextContent : undefined,
      description: hintDescription || undefined,
    };

    onChange(updatedHints);
    resetHintForm();
  };

  const handleDeleteHint = (index: number) => {
    const updatedHints = hints.filter((_, i) => i !== index);
    // Reorder remaining hints
    const reorderedHints = updatedHints.map((hint, i) => ({
      ...hint,
      order: i + 1,
    }));
    onChange(reorderedHints);
  };

  const handleMoveHint = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === hints.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updatedHints = [...hints];
    const temp = updatedHints[index]!;
    updatedHints[index] = updatedHints[newIndex]!;
    updatedHints[newIndex] = temp;

    // Update order numbers
    const reorderedHints = updatedHints.map((hint, i) => ({
      ...hint,
      order: i + 1,
    }));

    onChange(reorderedHints);
  };

  const startEditHint = (index: number) => {
    const hint = hints[index]!;
    setHintType(hint.type);
    setHintMediaUrl(hint.mediaUrl || "");
    setHintTextContent(hint.textContent || "");
    setHintDescription(hint.description || "");
    setEditingHintIndex(index);
    setIsAddingHint(false);
  };

  const getHintTypeIcon = (type: string) => {
    switch (type) {
      case "audio":
        return "🎵";
      case "video":
        return "🎬";
      case "image":
        return "🖼️";
      case "text":
        return "📝";
      default:
        return "❓";
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Progressive Hints</span>
            {!isAddingHint && editingHintIndex === null && (
              <Button
                type="button"
                onClick={() => setIsAddingHint(true)}
                size="sm"
                variant="outline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4 mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Hint
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Hints List */}
          {hints.length > 0 && (
            <div className="space-y-2">
              {hints.map((hint, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 border rounded-lg bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {getHintTypeIcon(hint.type)} Hint {hint.order}
                      </Badge>
                      {hint.description && (
                        <span className="text-sm text-muted-foreground">
                          {hint.description}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-foreground">
                      {hint.type === "text"
                        ? hint.textContent?.substring(0, 100) +
                          (hint.textContent && hint.textContent.length > 100
                            ? "..."
                            : "")
                        : hint.mediaUrl}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMoveHint(index, "up")}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMoveHint(index, "down")}
                      disabled={index === hints.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditHint(index)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteHint(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hints.length === 0 && !isAddingHint && editingHintIndex === null && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hints added yet. Click "Add Hint" to create progressive hints for
              this question.
            </p>
          )}

          {/* Add/Edit Hint Form */}
          {(isAddingHint || editingHintIndex !== null) && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="font-semibold text-sm">
                {editingHintIndex !== null ? "Edit Hint" : "Add New Hint"}
              </h4>

              {/* Hint Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Hint Type</label>
                <Select
                  value={hintType}
                  onValueChange={(value) =>
                    setHintType(value as "audio" | "video" | "image" | "text")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">📝 Text</SelectItem>
                    <SelectItem value="audio">🎵 Audio</SelectItem>
                    <SelectItem value="video">🎬 Video</SelectItem>
                    <SelectItem value="image">🖼️ Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Media Upload for non-text hints */}
              {hintType !== "text" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Media File</label>
                  <MediaUpload
                    onUpload={(url) => setHintMediaUrl(url)}
                    accept={
                      hintType === "audio"
                        ? "audio/*"
                        : hintType === "video"
                          ? "video/*"
                          : "image/*"
                    }
                  />
                  {hintMediaUrl && (
                    <Input
                      type="text"
                      value={hintMediaUrl}
                      onChange={(e) => setHintMediaUrl(e.target.value)}
                      placeholder="Media URL"
                    />
                  )}
                </div>
              )}

              {/* Text Content for text hints */}
              {hintType === "text" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hint Text</label>
                  <Textarea
                    value={hintTextContent}
                    onChange={(e) => setHintTextContent(e.target.value)}
                    placeholder="Enter hint text..."
                    rows={3}
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description (Optional)
                </label>
                <Input
                  type="text"
                  value={hintDescription}
                  onChange={(e) => setHintDescription(e.target.value)}
                  placeholder="e.g., 'Longer audio clip' or 'Album cover'"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={
                    editingHintIndex !== null ? handleUpdateHint : handleAddHint
                  }
                  size="sm"
                >
                  {editingHintIndex !== null ? "Update Hint" : "Add Hint"}
                </Button>
                <Button
                  type="button"
                  onClick={resetHintForm}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

