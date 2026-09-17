"use client";

import { useRef, useState } from "react";
import { DownloadIcon, UploadIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { createBackup, parseBackup, restoreBackup } from "../bundle";
import type { BackupBundle } from "../types";

function backupFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `tanpotato-backup-${date}.json`;
}

function downloadBackup(bundle: BackupBundle): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = backupFilename();
  link.click();
  URL.revokeObjectURL(url);
}

export function BackupControls() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingBackup, setPendingBackup] = useState<BackupBundle | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  function handleExport() {
    downloadBackup(createBackup());
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // 같은 파일을 다시 골라도 onChange가 다시 일어나게 한다.
    if (!file) return;

    const text = await file.text();
    const backup = parseBackup(text);

    if (!backup) {
      setImportError("이 앱이 만든 백업 파일이 아니거나 손상된 파일입니다.");
      return;
    }

    setImportError(null);
    setPendingBackup(backup);
  }

  function confirmRestore() {
    if (!pendingBackup) return;
    restoreBackup(pendingBackup);
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1">
      <Button size="sm" type="button" variant="ghost" onClick={handleExport}>
        <DownloadIcon />
        내보내기
      </Button>
      <Button size="sm" type="button" variant="ghost" onClick={() => fileInputRef.current?.click()}>
        <UploadIcon />
        불러오기
      </Button>
      <input
        ref={fileInputRef}
        accept="application/json,.json"
        className="hidden"
        type="file"
        onChange={handleFileSelected}
      />
      {importError ? <p className="text-xs text-destructive">{importError}</p> : null}

      <AlertDialog open={pendingBackup !== null} onOpenChange={(open) => !open && setPendingBackup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>지금 기록을 파일 내용으로 바꿀까요?</AlertDialogTitle>
            <AlertDialogDescription>
              불러오기를 하면 지금 기록·실행 체크 상태·보유 종목이 전부 이 파일의 내용으로
              바뀝니다. 지금 상태를 남기고 싶다면 먼저 내보내기로 백업해 두세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>바꾸기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
