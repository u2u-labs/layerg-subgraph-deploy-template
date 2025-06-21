export type ContractEventHandler<EventDataType, EntityType extends { __typename?: string }> = (
  data: EventDataType,
  handlerFunc: (data: EventDataType) => EntityType
) => void
