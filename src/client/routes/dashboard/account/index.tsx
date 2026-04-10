import { useNavigate, useSearchParams } from "@solidjs/router";
import { AvatarUpload } from "~/client/components/avatar-upload.tsx";

import { LanguageSwitcher } from "~/client/components/language-switcher.tsx";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "~/client/components/ui/item.tsx";
import { useSession } from "~/client/contexts/session-context.tsx";

import * as m from "~/paraglide/messages.js";
import { format } from "date-fns";
import { createMemo, type JSX } from "solid-js";
import { EmailChangeOTPDialog } from "./_components/email-change-otp-dialog.tsx";
import { EmailDialog } from "./_components/email-dialog.tsx";
import { NameEditDialog } from "./_components/name-dialog.tsx";
import { PhoneDialog } from "./_components/phone-dialog.tsx";

export default function AccountIndexRoute(): JSX.Element {
  const session = useSession();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const newEmail = createMemo(() => {
    const email = searchParams.newEmail;
    return typeof email === "string" ? email : null;
  });

  const handleOTPDialogClose = () => {
    navigate("/account", { replace: true });
  };

  return (
    <div class="flex flex-1 flex-col gap-10">
      <div class="flex w-full items-center justify-between gap-4">
        <div>
          <h2>{m.account_title()}</h2>
          <p class="text-muted-foreground">
            {m.account_subtitle()}
          </p>
        </div>
        <AvatarUpload
          imageUrl={session.user.image}
          userName={session.user.name}
        />
      </div>

      <ItemGroup class="rounded-lg border bg-card">
        <Item>
          <ItemContent>
            <ItemDescription>
              {m.account_name()}
            </ItemDescription>
            <ItemTitle>
              {session.user.name}
            </ItemTitle>
          </ItemContent>
          <ItemActions>
            <NameEditDialog currentName={session.user.name} />
          </ItemActions>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent>
            <ItemDescription>
              {m.account_email()}
            </ItemDescription>
            <ItemTitle>
              {session.user.email}
            </ItemTitle>
          </ItemContent>
          <ItemActions>
            <EmailDialog currentEmail={session.user.email} />
          </ItemActions>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent>
            <ItemDescription>
              {m.account_phone()}
            </ItemDescription>
            <ItemTitle>
              {session.user.phoneNumber || m.account_phone_not_set()}
            </ItemTitle>
          </ItemContent>
          <ItemActions>
            <PhoneDialog currentPhoneNumber={session.user.phoneNumber} />
          </ItemActions>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent>
            <ItemDescription>
              {m.account_created()}
            </ItemDescription>
            <ItemTitle>
              {format(new Date(session.user.createdAt), "dd.MM.yyyy")}
            </ItemTitle>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent>
            <ItemDescription>
              {m.account_language()}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <LanguageSwitcher />
          </ItemActions>
        </Item>
      </ItemGroup>

      <EmailChangeOTPDialog
        newEmail={newEmail()}
        onClose={handleOTPDialogClose}
      />
    </div>
  );
}
