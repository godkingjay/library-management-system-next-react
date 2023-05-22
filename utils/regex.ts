export const EmailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const PasswordRegex = /^(?=.*[A-Za-z\d@$!%*?&])[A-Za-z\d@$!%*?&]{8,256}$/;

export const NameRegex =
	/^(?=.{1,49}$)([A-Z][a-z]*(?:[\s'-]([A-Z][a-z]*|[A-Z]?[a-z]+))*)$/;
