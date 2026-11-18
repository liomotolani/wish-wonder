
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "claims": {
                  Row: {
                    "claimed_at": string,"claimer_member_id": string,"gift_id": string,"gift_snapshot": Json | null,"id": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "claimed_at"?: string,"claimer_member_id": string,"gift_id": string,"gift_snapshot"?: Json | null,"id"?: string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "claimed_at"?: string,"claimer_member_id"?: string,"gift_id"?: string,"gift_snapshot"?: Json | null,"id"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "claims_claimer_member_id_fkey"
      columns: ["claimer_member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "claims_gift_id_fkey"
      columns: ["gift_id"]
isOneToOne: false
      referencedRelation: "gifts"
      referencedColumns: ["id"]
    }
                  ]
                },"device_links": {
                  Row: {
                    "created_at": string,"expires_at": string,"id": string,"member_id": string,"token_hash": string,"used_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"expires_at": string,"id"?: string,"member_id": string,"token_hash": string,"used_at"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"expires_at"?: string,"id"?: string,"member_id"?: string,"token_hash"?: string,"used_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "device_links_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    }
                  ]
                },"events": {
                  Row: {
                    "created_at": string,"family_id": string,"id": string,"name": string,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"family_id": string,"id"?: string,"name": string,"status"?: string
                  }
                  Update: {
                    "created_at"?: string,"family_id"?: string,"id"?: string,"name"?: string,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "events_family_id_fkey"
      columns: ["family_id"]
isOneToOne: false
      referencedRelation: "families"
      referencedColumns: ["id"]
    }
                  ]
                },"families": {
                  Row: {
                    "created_at": string,"group_type": string,"id": string,"invite_code": string,"name": string,"organiser_member_id": string | null,"requires_approval": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"group_type"?: string,"id"?: string,"invite_code": string,"name": string,"organiser_member_id"?: string | null,"requires_approval"?: boolean
                  }
                  Update: {
                    "created_at"?: string,"group_type"?: string,"id"?: string,"invite_code"?: string,"name"?: string,"organiser_member_id"?: string | null,"requires_approval"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "fk_families_organiser"
      columns: ["organiser_member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    }
                  ]
                },"gifts": {
                  Row: {
                    "created_at": string,"currency": string,"description": string | null,"event_id": string,"id": string,"image_url": string | null,"name": string,"owner_member_id": string,"preferences": string | null,"price_pence": number | null,"priority": string | null,"shop_url": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"currency"?: string,"description"?: string | null,"event_id": string,"id"?: string,"image_url"?: string | null,"name": string,"owner_member_id": string,"preferences"?: string | null,"price_pence"?: number | null,"priority"?: string | null,"shop_url"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"currency"?: string,"description"?: string | null,"event_id"?: string,"id"?: string,"image_url"?: string | null,"name"?: string,"owner_member_id"?: string,"preferences"?: string | null,"price_pence"?: number | null,"priority"?: string | null,"shop_url"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "gifts_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "gifts_owner_member_id_fkey"
      columns: ["owner_member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    }
                  ]
                },"member_sessions": {
                  Row: {
                    "created_at": string,"id": string,"member_id": string,"revoked_at": string | null,"token_hash": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"member_id": string,"revoked_at"?: string | null,"token_hash": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"member_id"?: string,"revoked_at"?: string | null,"token_hash"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "member_sessions_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    }
                  ]
                },"members": {
                  Row: {
                    "created_at": string,"display_name": string,"family_id": string,"id": string,"managed_by_member_id": string | null,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"display_name": string,"family_id": string,"id"?: string,"managed_by_member_id"?: string | null,"status"?: string
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string,"family_id"?: string,"id"?: string,"managed_by_member_id"?: string | null,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "members_family_id_fkey"
      columns: ["family_id"]
isOneToOne: false
      referencedRelation: "families"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "members_managed_by_member_id_fkey"
      columns: ["managed_by_member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    }
                  ]
                },"notices": {
                  Row: {
                    "created_at": string,"dismissed_at": string | null,"id": string,"member_id": string,"message": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"dismissed_at"?: string | null,"id"?: string,"member_id": string,"message": string
                  }
                  Update: {
                    "created_at"?: string,"dismissed_at"?: string | null,"id"?: string,"member_id"?: string,"message"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notices_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    }
                  ]
                },"picker_visits": {
                  Row: {
                    "buyer_member_id": string,"created_at": string,"id": string,"peeked_gift_ids": (string)[],"recipient_member_id": string,"seed": number
                  }
                  ComputedFields: never
                  Insert: {
                    "buyer_member_id": string,"created_at"?: string,"id"?: string,"peeked_gift_ids"?: (string)[],"recipient_member_id": string,"seed": number
                  }
                  Update: {
                    "buyer_member_id"?: string,"created_at"?: string,"id"?: string,"peeked_gift_ids"?: (string)[],"recipient_member_id"?: string,"seed"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "picker_visits_buyer_member_id_fkey"
      columns: ["buyer_member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "picker_visits_recipient_member_id_fkey"
      columns: ["recipient_member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    }
                  ]
                },"reveal_attempts": {
                  Row: {
                    "created_at": string,"id": number,"member_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: number,"member_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: number,"member_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reveal_attempts_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "archive_event":
{ Args: { "p_event_id": string,"p_family_id": string,"p_organiser_member_id": string }; Returns: string
                           },
"claim_gift":
{ Args: { "p_claimer_member_id": string,"p_family_id": string,"p_gift_id": string,"p_snapshot": Json }; Returns: string
                           },
"consume_reveal_attempt":
{ Args: { "p_limit": number,"p_member_id": string,"p_window_seconds": number }; Returns: boolean
                           },
"allow_api_request":
{ Args: { "p_action": string,"p_key_hash": string,"p_limit": number,"p_window_seconds": number }; Returns: boolean
                           },
"create_family":
{ Args: { "p_event_name": string,"p_family_name": string,"p_group_type": string,"p_invite_code": string,"p_member_name": string,"p_requires_approval": boolean,"p_token_hash": string }; Returns: Json
                           },
"create_next_event":
{ Args: { "p_event_name": string,"p_family_id": string,"p_organiser_member_id": string }; Returns: Json
                           },
"delete_own_gift":
{ Args: { "p_gift_id": string,"p_owner_member_id": string }; Returns: string
                           },
"join_family":
{ Args: { "p_invite_code": string,"p_member_name": string,"p_token_hash": string }; Returns: Json
                           },
"reissue_member_link":
{ Args: { "p_family_id": string,"p_member_id": string,"p_new_token_hash": string,"p_organiser_member_id": string }; Returns: string
                           },
"remove_family_member":
{ Args: { "p_family_id": string,"p_member_id": string,"p_organiser_member_id": string }; Returns: string
                           },
"use_device_link":
{ Args: { "p_new_session_token_hash": string,"p_token_hash": string }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
